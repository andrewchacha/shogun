package accountstore

import (
	"errors"
	"shogun/internal/model/account"
	"shogun/internal/model/chain"

	"github.com/jmoiron/sqlx"
)

var ErrorAccountNotFound = errors.New("account not found")

type Store interface {
	CreateAccount(acc *account.Account) error
	CreateAccountNoCommit(tx *sqlx.Tx, acc *account.Account) error
	GetAccount(address string, chain chain.Chain) (*account.Account, error)
	GetUserIDForAddress(address string, chain chain.Chain) (int64, error)
	LinkAccounts(userID int64, accounts []account.Account) error
	DoesAccountExist(address string, chain chain.Chain) (bool, error)
	GetSimpleByUserID(userID int64) ([]account.Simple, error)
}
