package tokenstore

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"mime"
	"shogun/internal/data"
	"shogun/internal/model/chain"
	"shogun/internal/model/token"
	"shogun/internal/services/fileuploader"
	"shogun/internal/services/proxy"
	"strings"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/gommon/random"
	cmap "github.com/orcaman/concurrent-map/v2"
	"github.com/patrickmn/go-cache"
	"github.com/rs/zerolog/log"
)

var ErrorTokenNotFound = errors.New("token not found")
var ErrorChainNotSupported = errors.New("chain not supported")

type TokenStore struct {
	cachedTokens  *cache.Cache
	createdTokens cmap.ConcurrentMap[string, struct{}]
	db            *sqlx.DB
	fetchers      map[chain.Chain]Fetcher
	fileUploader  fileuploader.Service
}

func NewTokenStorage(db *sqlx.DB, fetchers map[chain.Chain]Fetcher, uploader fileuploader.Service) *TokenStore {
	if fetchers == nil {
		log.Fatal().Msg("fetchers is nil")
	}
	return &TokenStore{
		cachedTokens:  cache.New(60*time.Minute, cache.NoExpiration),
		createdTokens: cmap.New[struct{}](),
		db:            db,
		fetchers:      fetchers,
		fileUploader:  uploader,
	}
}

func (s *TokenStore) Run() {
	//do nothing for now, if needed be we'll add all in memory
	//for now just fetch and put in memory on demand
	go func() {
		for {
			s.HandleTokenLogo()
			time.Sleep(1 * time.Minute)
		}
	}()
}

func (s *TokenStore) Get(address string, chain chain.Chain) (*token.Token, error) {
	if t, found := s.cachedTokens.Get(address); found {
		return t.(*token.Token), nil
	}
	if t, err := s.getFromDB(address, chain); err == nil {
		s.cachedTokens.Set(t.Address, t, cache.DefaultExpiration)
		return t, nil
	}
	if t, err := s.getFromChain(address, chain); err == nil {
		s.cachedTokens.Set(t.Address, t, cache.DefaultExpiration)
		err = s.Create(t)
		if err != nil {
			return nil, err
		}
		return t, nil
	} else {
		log.Warn().Err(err).Str("address", address).Msg("failed to get token from chain")
	}
	return nil, ErrorTokenNotFound
}

func (s *TokenStore) getFromDB(address string, chain chain.Chain) (*token.Token, error) {
	t := token.Token{}
	if address == "" {
		return nil, ErrorTokenNotFound
	}
	var err error
	if chain == "" {
		err = s.db.Get(&t, "SELECT * FROM shogun.token WHERE address = $1", address)
	} else {
		err = s.db.Get(&t, "SELECT * FROM shogun.token WHERE address = $1 AND chain = $2", address, chain)
	}
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorTokenNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (s *TokenStore) getFromChain(address string, chain chain.Chain) (*token.Token, error) {
	if fetcher, ok := s.fetchers[chain]; ok {
		return fetcher.Fetch(address)
	}
	return nil, ErrorChainNotSupported
}

func (s *TokenStore) Create(t *token.Token) error {
	if t == nil {
		return errors.New("token is nil")
	}
	if s.createdTokens.Has(t.Address) {
		return nil
	}
	if t.Address == "" || t.Name == "" || t.Symbol == "" || t.Chain == "" {
		return errors.New("invalid token")
	}
	_, err := s.db.NamedExec("INSERT INTO shogun.token (address, name, symbol, chain, decimals, logo, meta) VALUES (:address, :name, :symbol, :chain, :decimals, :logo, :meta)", t)
	if err != nil {
		if data.IsUniqueViolation(err) {
			s.createdTokens.Set(t.Address, struct{}{})
			return nil
		}
		return err
	}
	s.createdTokens.Set(t.Address, struct{}{})
	return nil
}

func (s *TokenStore) HandleTokenLogo() {
	tokens := make([]token.Token, 0)
	err := s.db.Select(&tokens, "SELECT address, symbol, chain, logo FROM shogun.token WHERE status = $1", token.StatusNew)
	if err != nil {
		log.Warn().Err(err).Msg("failed to get tokens")
		return
	}
	for _, t := range tokens {
		var logoUrl string
		var err error
		if strings.HasPrefix(t.Logo, "data:image/") {
			logoUrl, err = s.handleBase64Logo(&t)
		} else if strings.HasPrefix(t.Logo, "https://images.shogun.social") {
			_ = s.updateLogoStatus(t.Address, t.Chain, token.StatusHandled)
			continue
		} else if strings.HasPrefix(t.Logo, "http") {
			logoUrl, err = s.HandleURLLogo(&t)
		} else {
			_ = s.updateLogoStatus(t.Address, t.Chain, token.StatusFailed)
			continue
		}
		if err != nil || len(logoUrl) < 5 {
			_ = s.updateLogoStatus(t.Address, t.Chain, token.StatusFailed)
			continue
		}
		if len(logoUrl) > 5 {
			_, err = s.db.Exec("UPDATE shogun.token SET logo = $1, status = $2 WHERE address = $3 AND chain = $4", logoUrl, token.StatusHandled, t.Address, t.Chain)
			if err != nil {
				log.Warn().Err(err).Msg("failed to update token")
			}
		}
	}
}

// handleBase64Logo, image in form of data:image/webp;base64,UklGRkAkAABXRUJ
// parsed and uploaded to cloudflare then the token is updated with the new URL
func (s *TokenStore) handleBase64Logo(t *token.Token) (string, error) {
	parts := strings.SplitN(t.Logo, ",", 2)
	if len(parts) != 2 {
		return "", errors.New("invalid base64 data")
	}
	metadata := parts[0]
	data := parts[1]

	metaParts := strings.SplitN(metadata, ";", 2)
	if len(metaParts) != 2 {
		return "", errors.New("invalid base64 metadata")
	}

	contentType := metaParts[0][5:]
	binaryData, err := base64.StdEncoding.DecodeString(data)
	if err != nil {
		return "", err
	}
	ext := ""
	if exts, _ := mime.ExtensionsByType(contentType); len(exts) > 0 {
		ext = exts[len(exts)-1]
	}
	fileName := strings.ToLower(fmt.Sprintf("coin_%s_%s_%s%s", t.Symbol, t.Chain, random.String(5), ext))
	res, err := s.fileUploader.Upload(&fileuploader.Data{
		Body:        bytes.NewReader(binaryData),
		FileName:    fileName,
		ContentType: contentType,
	})
	return res, err
}

func (s *TokenStore) HandleURLLogo(t *token.Token) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	res, err := proxy.Get(ctx, t.Logo)
	if err != nil {
		return "", err
	}
	contentType := mimetype.Detect(res).String()
	if !strings.HasPrefix(contentType, "image/") {
		return "", errors.New("invalid content type")
	}
	fileName := strings.ToLower(fmt.Sprintf("coin_%s_%s_%s", t.Symbol, t.Chain, random.String(5)))
	uploadedUrl, err := s.fileUploader.Upload(&fileuploader.Data{
		Body:        bytes.NewReader(res),
		FileName:    fileName,
		ContentType: contentType,
	})
	return uploadedUrl, err
}

func (s *TokenStore) updateLogoStatus(address string, chain chain.Chain, status token.Status) error {
	_, err := s.db.Exec("UPDATE shogun.token SET status = $1 WHERE address = $2 AND chain = $3", status, address, chain)
	return err
}
