package token

import (
	"database/sql/driver"
	"encoding/json"
	"shogun/internal/model/chain"
	"time"
)

type Status int

const (
	StatusNew     = 0
	StatusHandled = 1
	StatusFailed  = 2
)

type Token struct {
	Address   string      `db:"address" json:"address"`
	Symbol    string      `db:"symbol" json:"symbol"`
	Name      string      `db:"name" json:"name"`
	Decimals  int         `db:"decimals" json:"decimals"`
	Logo      string      `db:"logo" json:"logo"`
	Meta      Meta        `db:"meta" json:"meta,omitempty"`
	Chain     chain.Chain `db:"chain" json:"chain"`
	Status    Status      `db:"status" json:"-"`
	CreatedAt time.Time   `db:"created_at" json:"-"`
}

// Meta - Add more token specific instructions in here
type Meta struct {
	SuiObjectID string `json:"sui_object_id,omitempty"`
}

func (m *Meta) Scan(src interface{}) error {
	jsonBytes, ok := src.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(jsonBytes, m)
}

func (m Meta) Value() (driver.Value, error) {
	jsonBytes, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	return jsonBytes, nil
}
