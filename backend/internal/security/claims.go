package accesstoken

import (
	"time"
)

type Claims struct {
	UserID   int64 `json:"aud,string,omitempty"`
	IssuedAt int64 `json:"iat,string,omitempty"`
	ExpireAt int64 `json:"exp,string,omitempty"`
}

func (c Claims) verifyAudience() bool {
	return c.UserID != 0
}

func (c Claims) verifyExpiresAt() bool {
	return time.Unix(c.ExpireAt, 0).After(time.Now())
}

func (m Claims) verifyIssuedAt() bool {
	return time.Unix(m.IssuedAt, 0).Before(time.Now())
}

func (m Claims) Valid() error {
	if !m.verifyExpiresAt() {
		return ErrorTokenExpired
	}
	if !m.verifyIssuedAt() {
		return ErrorTokenUsedBeforeTime
	}
	if !m.verifyAudience() {
		return ErrorInvalidUser
	}
	return nil
}
