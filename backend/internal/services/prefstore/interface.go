package prefstore

import (
	"errors"
	"shogun/internal/model/preferences"
)

var ErrorDuplicateUserID = errors.New("user already has preferences")
var ErrorNotFound = errors.New("preferences not found")
var ErrorKeyNotFound = errors.New("key not found")

type Store interface {
	Create(userID int64, u *preferences.Preferences) error
	Update(userID int64, preferences *preferences.Preferences) error
	Get(userID int64) (*preferences.Preferences, error)
}
