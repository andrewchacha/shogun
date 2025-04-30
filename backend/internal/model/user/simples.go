package user

import (
	"shogun/internal/model/chain"
	"shogun/internal/model/image"
)

type Simple struct {
	ID        int64       `db:"id" json:"id,string"`
	Username  string      `db:"username" json:"username"`
	Name      string      `db:"name" json:"name"`
	Thumbnail image.Image `db:"thumbnail" json:"thumbnail"`
}

type SimpleByAddress struct {
	Simple
	Address string `db:"address" json:"address"`
}

type Address struct {
	Address string      `db:"address" json:"address"`
	Chain   chain.Chain `db:"chain" json:"chain"`
}
