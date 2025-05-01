package tokenstore

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"shogun/internal/model/chain"
	"shogun/internal/model/token"
	"time"

	"github.com/labstack/gommon/random"
	"github.com/rs/zerolog/log"
)

type SolanaHelius struct {
	apiKey string
	client *http.Client
}

func NewSolanaHelius(apiKey string) *SolanaHelius {
	return &SolanaHelius{
		apiKey: apiKey,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (sh *SolanaHelius) Fetch(address string) (*token.Token, error) {
	log.Debug().Str("address", address).Msg("fetching token from helius")

	endpoint := "https://mainnet.helius-rpc.com/?api-key=" + sh.apiKey
	params := map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      random.String(15),
		"method":  "getAsset",
		"params": map[string]interface{}{
			"id": address,
		},
	}

	body, err := json.Marshal(params)
	if err != nil {
		log.Fatal().Err(err).Send()
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(body))
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := sh.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	resBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	tokenData := &tokenRes{}
	err = json.Unmarshal(resBody, tokenData)
	if err != nil {
		log.Error().Err(err).Str("body", string(resBody)).Msg("error unmarshalling token data")
		return nil, errors.New(string(resBody))
	}

	if tokenData.Result.TokenInfo.Symbol == "" {
		return nil, errors.New("token not found: " + string(resBody))
	}

	log.Debug().Str("symbol", tokenData.Result.TokenInfo.Symbol).Msg("token found")
	t := &token.Token{
		Address:  address,
		Symbol:   tokenData.Result.TokenInfo.Symbol,
		Name:     tokenData.Result.Content.Metadata.Name,
		Decimals: tokenData.Result.TokenInfo.Decimals,
		Logo:     tokenData.Result.Content.Links.Image,
		Chain:    chain.Solana,
	}
	return t, nil
}

type tokenRes struct {
	Jsonrpc string `json:"jsonrpc"`
	Result  struct {
		Interface string `json:"interface"`
		Id        string `json:"id"`
		Content   struct {
			Schema  string `json:"$schema"`
			JsonUri string `json:"json_uri"`
			Files   []struct {
				Uri    string `json:"uri"`
				CdnUri string `json:"cdn_uri"`
				Mime   string `json:"mime"`
			} `json:"files"`
			Metadata struct {
				Description   string `json:"description"`
				Name          string `json:"name"`
				Symbol        string `json:"symbol"`
				TokenStandard string `json:"token_standard"`
			} `json:"metadata"`
			Links struct {
				Image string `json:"image"`
			} `json:"links"`
		} `json:"content"`
		//Authorities []struct {
		//	Address string   `json:"address"`
		//	Scopes  []string `json:"scopes"`
		//} `json:"authorities"`
		//Compression struct {
		//	Eligible    bool   `json:"eligible"`
		//	Compressed  bool   `json:"compressed"`
		//	DataHash    string `json:"data_hash"`
		//	CreatorHash string `json:"creator_hash"`
		//	AssetHash   string `json:"asset_hash"`
		//	Tree        string `json:"tree"`
		//	Seq         int    `json:"seq"`
		//	LeafId      int    `json:"leaf_id"`
		//} `json:"compression"`
		//Royalty struct {
		//	RoyaltyModel        string  `json:"royalty_model"`
		//	Percent             float64 `json:"percent"`
		//	BasisPoints         int     `json:"basis_points"`
		//	PrimarySaleHappened bool    `json:"primary_sale_happened"`
		//	Locked              bool    `json:"locked"`
		//} `json:"royalty"`
		//Ownership struct {
		//	Frozen         bool   `json:"frozen"`
		//	Delegated      bool   `json:"delegated"`
		//	OwnershipModel string `json:"ownership_model"`
		//	Owner          string `json:"owner"`
		//} `json:"ownership"`
		Mutable   bool `json:"mutable"`
		Burnt     bool `json:"burnt"`
		TokenInfo struct {
			Symbol string `json:"symbol"`
			//Supply       int64  `json:"supply"`
			Decimals     int    `json:"decimals"`
			TokenProgram string `json:"token_program"`
			PriceInfo    struct {
				PricePerToken float64 `json:"price_per_token"`
				Currency      string  `json:"currency"`
			} `json:"price_info"`
		} `json:"token_info"`
	} `json:"result"`
	Id string `json:"id"`
}
