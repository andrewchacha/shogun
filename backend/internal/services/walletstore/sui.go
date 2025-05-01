package walletstore

import (
	"context"
	"shogun/internal/model/chain"
	"shogun/internal/services/pricefetcher"
	"shogun/internal/services/tokenstore"

	"github.com/block-vision/sui-go-sdk/models"
	"github.com/block-vision/sui-go-sdk/sui"
	"github.com/shopspring/decimal"
)

const SuiCoinAddress = "0x2::sui::SUI"

type SuiFetcher struct {
	client sui.ISuiAPI
	store  tokenstore.Store
}

func NewSuiWalletService(client sui.ISuiAPI, store tokenstore.Store) *SuiFetcher {
	return &SuiFetcher{
		client: client,
		store:  store,
	}
}

func (s *SuiFetcher) CoinsOwnedBy(ctx context.Context, address string) (*CoinsOwned, error) {
	res := &CoinsOwned{}
	allCoins, err := s.getAllCoins(ctx, address)
	if err != nil {
		return nil, err
	}
	//all coins returns native balance as well, remove it from there
	for i, coin := range allCoins {
		if coin.Address == SuiCoinAddress {
			res.NativeBalance = coin
			allCoins = append(allCoins[:i], allCoins[i+1:]...)
			break
		}
	}
	res.Tokens = allCoins
	return res, nil
}

func (s *SuiFetcher) getAllCoins(ctx context.Context, address string) ([]Token, error) {
	res, err := s.client.SuiXGetAllBalance(ctx, models.SuiXGetAllBalanceRequest{Owner: address})
	if err != nil {
		return nil, err
	}

	allMints := make([]string, 0, len(res))
	for _, item := range res {
		allMints = append(allMints, item.CoinType)
	}
	//prepare price fetcher for all mints
	prices, err := pricefetcher.G().GetPriceMulti(ctx, allMints)
	if err != nil {
		prices = make(map[string]decimal.Decimal)
	}

	//for new accounts just initialize to zero
	if len(res) == 0 {
		res = []models.CoinBalanceResponse{
			{
				CoinType:        SuiCoinAddress,
				CoinObjectCount: 0,
				TotalBalance:    "0",
			},
		}
	}

	tokens := make([]Token, 0)
	for _, item := range res {
		if item.TotalBalance == "0" && item.CoinType != SuiCoinAddress {
			continue
		}
		totalBalance, _ := decimal.NewFromString(item.TotalBalance)
		t := &Token{
			Address: item.CoinType,
			Price:   prices[item.CoinType],
			Chain:   chain.Sui,
			Balance: Balance{
				RawAmount: totalBalance,
			},
		}
		if savedToken, _ := s.store.Get(item.CoinType, chain.Sui); savedToken != nil {
			t.Name = savedToken.Name
			t.Symbol = savedToken.Symbol
			t.Decimals = savedToken.Decimals
			t.UiAmount = totalBalance.Shift(-int32(savedToken.Decimals))
			t.Logo = savedToken.Logo
		}
		tokens = append(tokens, *t)
	}
	return tokens, nil
}
