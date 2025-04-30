package transaction

import (
	"shogun/internal/model/token"
	"shogun/internal/model/user"

	"github.com/shopspring/decimal"
)

type Type string

const (
	TypeTransfer Type = "transfer"
	TypeSwap     Type = "swap"
	TypeUnknown  Type = "unknown"
)

type Transaction struct {
	Type        Type         `json:"type"`
	Signature   string       `json:"signature"`
	FromAddress string       `json:"from_address"`
	ToAddress   string       `json:"to_address"`
	Timestamp   int64        `json:"timestamp"`
	Fee         Fee          `json:"fee"`
	Changes     []Transfer   `json:"changes"`
	Failed      bool         `json:"failed"`
	User        *user.Simple `json:"user"`
}

type Fee struct {
	Amount decimal.Decimal `json:"amount"`
	Symbol string          `json:"symbol"`
}

type Transfer struct {
	UIAmount decimal.Decimal `json:"ui_amount"`
	token.Token
}

func (t Transfer) Add(t2 *Transfer) Transfer {
	return Transfer{
		UIAmount: t.UIAmount.Add(t2.UIAmount),
		Token:    t.Token,
	}
}
