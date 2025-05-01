package usercache

import (
	"errors"
	"shogun/internal/model/chain"
	"shogun/internal/model/user"
)

var (
	ErrorUserNotFound = errors.New("user not found")
)

type SimpleCache interface {
	Init()
	GetByID(id int64) (*user.Simple, error)
	GetByUsername(username string) (*user.Simple, error)
	GetByAddress(address string, chain chain.Chain) (*user.Simple, error)
}
