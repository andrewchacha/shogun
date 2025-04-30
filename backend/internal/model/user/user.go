package user

import (
	"regexp"
	"shogun/config"
	"shogun/internal/model/image"
	"time"
)

type User struct {
	ID        int64       `db:"id" json:"id,string"`
	Username  string      `db:"username" json:"username"`
	Name      string      `db:"name" json:"name"`
	Bio       string      `db:"bio" json:"bio"`
	Thumbnail image.Image `db:"thumbnail" json:"thumbnail"`
	Meta      Meta        `db:"meta" json:"meta"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt time.Time   `db:"updated_at" json:"updated_at"`
}

type Updatable struct {
	Username *string `db:"username" json:"username"`
	Name     *string `db:"name" json:"name"`
	Bio      *string `db:"bio" json:"bio"`
}

func New() *User {
	return &User{}
}

func IsUsernameValid(username string) bool {
	return len(username) >= config.Cfg.UsernameMinLengthNormal && len(username) <= config.Cfg.UsernameMaxLength && checkIsAlphaNumericWithUnderscore(username)
}

func IsNameValid(name string) bool {
	return len(name) >= 1 && len(name) <= 50
}

func IsBioValid(bio string) bool {
	return len(bio) <= config.Cfg.BioMaxLength
}

func checkIsAlphaNumericWithUnderscore(s string) bool {
	validUsername := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return validUsername.MatchString(s)
}
