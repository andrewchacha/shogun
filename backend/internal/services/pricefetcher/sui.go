package pricefetcher

import (
	"context"

	"github.com/shopspring/decimal"
)

type Sui struct {
}

func (sps *Sui) GetPrice(ctx context.Context, address string) (decimal.Decimal, error) {
	return decimal.Zero, nil
}

func NewSui() *Sui {
	return &Sui{}
}

func (sps *Sui) Start() {

}

func (sps *Sui) GetPriceMulti(ctx context.Context, addresses []string) (map[string]decimal.Decimal, error) {
	return nil, nil
}
