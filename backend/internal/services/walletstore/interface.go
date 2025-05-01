package walletstore

import (
	"context"
	"shogun/internal/model/chain"

	"github.com/shopspring/decimal"
)

// TODO in case of wallets, use socket to listen for changes for a few minutes when user checks in
type Fetcher interface {
	CoinsOwnedBy(ctx context.Context, address string) (*CoinsOwned, error)
}

type CoinsOwned struct {
	NativeBalance Token           `json:"native"`
	Tokens        []Token         `json:"tokens"`
	USDValue      decimal.Decimal `json:"usd_value"`
}

func (c *CoinsOwned) SetUSDValue() {
	c.NativeBalance.SetTotal()
	c.USDValue = c.NativeBalance.Total
	for i := range c.Tokens {
		t := &c.Tokens[i]
		t.SetTotal()
		c.USDValue = c.USDValue.Add(t.Total)
	}
}

type Balance struct {
	UiAmount  decimal.Decimal `json:"ui_amount"`
	RawAmount decimal.Decimal `json:"raw_amount"`
	Decimals  int             `json:"decimals"`
}

type Token struct {
	Name    string          `json:"name"`
	Chain   chain.Chain     `json:"chain"`
	Symbol  string          `json:"symbol"`
	Address string          `json:"address"`
	Logo    string          `json:"logo"`
	Price   decimal.Decimal `json:"price"`
	Total   decimal.Decimal `json:"total"`
	Balance
}

func (t *Token) SetTotal() {
	t.Total = t.Price.Mul(t.Balance.UiAmount)
}
