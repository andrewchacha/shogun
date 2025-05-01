package userstore

import (
	"errors"
	"shogun/internal/model/chain"
	"shogun/internal/model/image"
	"shogun/internal/model/user"

	"github.com/jmoiron/sqlx"
)

var (
	ErrorUserNotFound                     = errors.New("user not found")
	ErrorDuplicateUsername                = errors.New("duplicate username")
	ErrorUpdateNameBlockedTemporarily     = errors.New("update name blocked temporarily")
	ErrorUpdateUsernameBlockedTemporarily = errors.New("update username blocked temporarily")
)

type Store interface {
	CreateUserNoCommit(tx *sqlx.Tx, u *user.User) error
	GetOne(id int64) (*user.User, error)
	GetMeta(id int64) (*user.Meta, error)
	Update(id int64, updatable *user.Updatable) error
	UpdateThumbnail(id int64, thumbnail *image.Image) error
	GetSimpleOwnerOfAddress(address string, chain chain.Chain) (*user.Simple, error)
	GetSimpleOwnersOfAddresses(addresses []string, chain chain.Chain) ([]user.SimpleByAddress, error)
	GetSimpleByID(id int64) (*user.Simple, error)
	GetSimpleByUsername(username string) (*user.Simple, error)
	GetAllUsernames(func(username string)) error
}
