package account

import (
	"shogun/internal/model/chain"
	"time"
)

type Account struct {
	ID        int64       `db:"id" json:"id,string"`
	Address   string      `db:"address" json:"address"`
	UserID    int64       `db:"user_id" json:"user_id"`
	Chain     chain.Chain `db:"chain" json:"chain"`
	Signature string      `db:"signature" json:"signature"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
}

type Simple struct {
	Address   string      `db:"address" json:"address"`
	Chain     chain.Chain `db:"chain" json:"chain"`
	Signature string      `db:"signature" json:"signature"`
}

func New() *Account {
	return &Account{}
}
