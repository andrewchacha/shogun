package pricefetcher

import (
	"context"
	"errors"
	"shogun/internal/model/chain"
	"sync"

	"github.com/shopspring/decimal"
)

var ErrorChainNotSupported = errors.New("chain not supported")
var ErrorPriceNotFound = errors.New("price not found")

type fetcherKey string

const (
	fetcherDexscreener fetcherKey = "dexscreener"
	fetcherSui         fetcherKey = fetcherKey(chain.Sui)
	fetcherSolana      fetcherKey = fetcherKey(chain.Solana)
)

type Fetcher interface {
	Start()
	GetPrice(ctx context.Context, address string) (decimal.Decimal, error)
	GetPriceMulti(ctx context.Context, addresses []string) (map[string]decimal.Decimal, error)
}

var globalPriceFetcher *GlobalFetcher

// G returns the global price fetcher
func G() *GlobalFetcher {
	return globalPriceFetcher
}

func StartAll() {
	fetchers := map[fetcherKey]Fetcher{
		fetcherDexscreener: NewDexscreener(),
		fetcherSui:         NewSui(),
		fetcherSolana:      NewSolana(),
	}
	globalPriceFetcher = NewGlobalPriceFetcher(fetchers)
	globalPriceFetcher.Start()
}

type GlobalFetcher struct {
	fetchers  map[fetcherKey]Fetcher
	isRunning bool
	mu        sync.RWMutex
}

func NewGlobalPriceFetcher(fetchers map[fetcherKey]Fetcher) *GlobalFetcher {
	return &GlobalFetcher{
		fetchers: fetchers,
	}
}

func (gpf *GlobalFetcher) Start() {
	gpf.mu.Lock()
	defer gpf.mu.Unlock()
	if gpf.isRunning {
		return
	}
	gpf.isRunning = true
	for _, pf := range gpf.fetchers {
		go pf.Start()
	}
}

func (gpf *GlobalFetcher) GetPrice(ctx context.Context, address string) (decimal.Decimal, error) {
	//using dexscreener for everything for now
	fetcher, exists := gpf.fetchers["dexscreener"]
	if !exists {
		return decimal.Zero, ErrorChainNotSupported
	}
	return fetcher.GetPrice(ctx, address)
}

func (gpf *GlobalFetcher) GetPriceMulti(ctx context.Context, addresses []string) (map[string]decimal.Decimal, error) {
	//using dexscreener for everything for now
	fetcher, exists := gpf.fetchers["dexscreener"]
	if !exists {
		return nil, ErrorChainNotSupported
	}
	return fetcher.GetPriceMulti(ctx, addresses)
}
