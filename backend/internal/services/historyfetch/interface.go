package historyfetch

import (
	"context"
	"errors"
	"shogun/internal/model/chain"
	"shogun/internal/model/transaction"
)

var ErrorChainNotSupported = errors.New("chain not supported")

type AllFetcher interface {
	Fetch(ctx context.Context, address string, chain chain.Chain) ([]transaction.Transaction, error)
}

type ChainFetcher interface {
	Fetch(ctx context.Context, address string) ([]transaction.Transaction, error)
}

type AllChainFetcher struct {
	fetchers map[chain.Chain]ChainFetcher
}

func NewAllChainFetcher(fetchers map[chain.Chain]ChainFetcher) *AllChainFetcher {
	return &AllChainFetcher{
		fetchers: fetchers,
	}
}

func (a *AllChainFetcher) Fetch(ctx context.Context, address string, chain chain.Chain) ([]transaction.Transaction, error) {
	f, exists := a.fetchers[chain]
	if !exists {
		return nil, ErrorChainNotSupported
	}
	return f.Fetch(ctx, address)
}
