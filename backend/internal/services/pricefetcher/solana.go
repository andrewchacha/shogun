package pricefetcher

import (
	"context"

	"github.com/shopspring/decimal"
)

const (
	SolanaMintUSDC    = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
	SolanaMintWrapped = "So11111111111111111111111111111111111111112"
)

type Solana struct {
}

func NewSolana() *Solana {
	return &Solana{}
}

func (sps *Solana) Start() {

}

func (sps *Solana) GetPrice(ctx context.Context, address string) (decimal.Decimal, error) {
	return decimal.Zero, nil
}

func (sps *Solana) GetPriceMulti(ctx context.Context, addresses []string) (map[string]decimal.Decimal, error) {
	return nil, nil
}
