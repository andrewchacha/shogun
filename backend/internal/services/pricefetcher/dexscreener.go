package pricefetcher

import (
	"context"
	"encoding/json"
	"errors"
	"shogun/internal/services/proxy"
	"strings"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/patrickmn/go-cache"
	"github.com/rs/zerolog/log"
	"github.com/shopspring/decimal"
	"golang.org/x/time/rate"
)

type Dexscreener struct {
	AllMints *cache.Cache
	Prices   *cache.Cache
}

func NewDexscreener() *Dexscreener {
	return &Dexscreener{
		AllMints: cache.New(5*time.Minute, 5*time.Minute),
		Prices:   cache.New(5*time.Minute, 5*time.Minute),
	}
}

func (dps *Dexscreener) GetPrice(ctx context.Context, address string) (decimal.Decimal, error) {
	if address == solana.SystemProgramID.String() {
		address = SolanaMintWrapped
	}
	if p, exists := dps.Prices.Get(address); exists {
		//adding to cache so that we fetch the price again in the next 5min
		dps.AllMints.Set(address, nil, cache.DefaultExpiration)
		return p.(decimal.Decimal), nil
	}
	dps.AllMints.Set(address, nil, cache.DefaultExpiration)
	dps.fetchPriceFromDexScreener(ctx, []string{address})
	if p, exists := dps.Prices.Get(address); exists {
		return p.(decimal.Decimal), nil
	}
	return decimal.Zero, ErrorPriceNotFound
}

func (dps *Dexscreener) Start() {
	log.Info().Msg("starting dexscreenr price fetcher")
	dps.fetchPrices()
	for range time.Tick(5 * time.Second) {
		dps.fetchPrices()
	}
}

func (dps *Dexscreener) fetchPrices() {
	mintsMap := dps.AllMints.Items()
	allMints := make([]string, 0, len(mintsMap))
	for mint := range mintsMap {
		allMints = append(allMints, mint)
	}

	batchSize := 30
	for i := 0; i < len(allMints); i += batchSize {
		end := i + batchSize
		if end > len(allMints) {
			end = len(allMints)
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		dps.fetchPriceFromDexScreener(ctx, allMints[i:end])
		cancel()
	}
}

var dexScreenRateLimiter = rate.NewLimiter(rate.Limit(5), 1)

func fetchDexScreener(ctx context.Context, mints []string) (*dexScreenerPriceItem, error) {
	_ = dexScreenRateLimiter.Wait(context.Background())
	endpoint := "https://api.dexscreener.com/latest/dex/tokens/" + strings.Join(mints, ",")
	body, err := proxy.Get(ctx, endpoint)
	if err != nil {
		return nil, err
	}
	res := &dexScreenerPriceItem{}
	err = json.Unmarshal(body, res)
	if err != nil {
		return nil, errors.New(string(body))
	}
	return res, nil
}

type compareValues struct {
	address   string
	liquidity decimal.Decimal
	usdPrice  decimal.Decimal
}

func (dps *Dexscreener) fetchPriceFromDexScreener(ctx context.Context, mints []string) {
	res, err := fetchDexScreener(ctx, mints)
	if err != nil {
		log.Err(err).Msg("failed to fetch prices from dexscreener")
		return
	}

	//we use to get the highest liquidity pools price
	compareData := make(map[string]compareValues)
	for _, item := range res.Pairs {
		ck := item.BaseToken.Address + item.QuoteToken.Address
		if v, exists := compareData[ck]; exists {
			if v.liquidity.GreaterThanOrEqual(item.Liquidity.Usd) {
				continue
			}
		}
		compareData[ck] = compareValues{
			liquidity: item.Liquidity.Usd,
			usdPrice:  item.PriceUsd,
			address:   item.BaseToken.Address,
		}
	}
	for _, item := range compareData {
		dps.Prices.Set(item.address, item.usdPrice, cache.DefaultExpiration)
	}
}

func (dps *Dexscreener) GetPriceMulti(ctx context.Context, addresses []string) (map[string]decimal.Decimal, error) {
	res := make(map[string]decimal.Decimal)
	missingMints := make([]string, 0, len(addresses))
	for _, address := range addresses {
		if address == solana.SystemProgramID.String() {
			address = SolanaMintWrapped
		}
		if p, exists := dps.Prices.Get(address); exists {
			dps.AllMints.Set(address, nil, cache.DefaultExpiration)
			res[address] = p.(decimal.Decimal)
		} else {
			missingMints = append(missingMints, address)
		}
	}

	//fetch prices for missing mints in batches of 30
	batchSize := 30
	for i := 0; i < len(missingMints); i += batchSize {
		end := i + batchSize
		if end > len(missingMints) {
			end = len(missingMints)
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		dps.fetchPriceFromDexScreener(ctx, missingMints[i:end])
		cancel()
	}

	for _, address := range missingMints {
		p, err := dps.GetPrice(ctx, address)
		if err != nil {
			res[address] = decimal.Zero
			continue
		}
		res[address] = p
	}
	return res, nil
}

type dexScreenerPriceItem struct {
	SchemaVersion string            `json:"schemaVersion"`
	Pairs         []dexScreenerPair `json:"pairs"`
}

type dexScreenerPair struct {
	ChainId       string                 `json:"chainId"`
	DexId         string                 `json:"dexId"`
	Url           string                 `json:"url"`
	PairAddress   string                 `json:"pairAddress"`
	BaseToken     dexScreenerToken       `json:"baseToken"`
	QuoteToken    dexScreenerToken       `json:"quoteToken"`
	PriceNative   decimal.Decimal        `json:"priceNative"`
	PriceUsd      decimal.Decimal        `json:"priceUsd"`
	Volume        dexScreenerVolume      `json:"volume"`
	PriceChange   dexScreenerPriceChange `json:"priceChange"`
	Liquidity     dexScreenerLiquidity   `json:"liquidity"`
	Fdv           decimal.Decimal        `json:"fdv"`
	PairCreatedAt int64                  `json:"pairCreatedAt"`
}

type dexScreenerLiquidity struct {
	Usd   decimal.Decimal `json:"usd"`
	Base  decimal.Decimal `json:"base"`
	Quote decimal.Decimal `json:"quote"`
}
type dexScreenerPriceChange struct {
	M5  decimal.Decimal `json:"m5"`
	H1  decimal.Decimal `json:"h1"`
	H6  decimal.Decimal `json:"h6"`
	H24 decimal.Decimal `json:"h24"`
}

type dexScreenerVolume struct {
	H24 decimal.Decimal `json:"h24"`
	H6  decimal.Decimal `json:"h6"`
	H1  decimal.Decimal `json:"h1"`
	M5  decimal.Decimal `json:"m5"`
}

type dexScreenerToken struct {
	Address string `json:"address"`
	Name    string `json:"name"`
	Symbol  string `json:"symbol"`
}
