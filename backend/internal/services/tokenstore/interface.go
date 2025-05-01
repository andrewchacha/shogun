package tokenstore

import (
	"shogun/internal/model/chain"
	"shogun/internal/model/token"
	"shogun/internal/services/fileuploader"

	"github.com/jmoiron/sqlx"
)

type Store interface {
	Run()
	Get(address string, chain chain.Chain) (*token.Token, error)
	Create(token *token.Token) error
}

type Fetcher interface {
	Fetch(address string) (*token.Token, error)
}

var storage Store

func Init(db *sqlx.DB, fetchers map[chain.Chain]Fetcher, logoUploader fileuploader.Service) Store {
	storage = NewTokenStorage(db, fetchers, logoUploader)
	storage.Run()
	return storage
}
