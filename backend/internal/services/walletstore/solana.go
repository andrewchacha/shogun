package walletstore

import (
	"context"
	"errors"
	"math/big"
	"shogun/internal/model/chain"
	"shogun/internal/model/token"
	"shogun/internal/services/pricefetcher"
	"shogun/internal/services/tokenstore"

	"github.com/gagliardetto/solana-go"
	"github.com/gagliardetto/solana-go/rpc"
	"github.com/shopspring/decimal"
)

// TODO cache and listen for changes
type SolanaFetcher struct {
	client *rpc.Client
	store  tokenstore.Store
}

func NewSolanaWalletService(client *rpc.Client, store tokenstore.Store) *SolanaFetcher {
	return &SolanaFetcher{
		client: client,
		store:  store,
	}
}

func (s *SolanaFetcher) CoinsOwnedBy(ctx context.Context, address string) (*CoinsOwned, error) {
	res := &CoinsOwned{}
	nativeBalance, err := s.getNativeBalance(ctx, address)
	if err != nil {
		return nil, err
	}
	res.NativeBalance = *nativeBalance
	tokens, err := s.getTokensOwnedBy(ctx, address)
	if err != nil {
		return nil, err
	}
	res.Tokens = tokens
	return res, nil
}

func (s *SolanaFetcher) getNativeBalance(ctx context.Context, address string) (*Token, error) {
	pk, err := solana.PublicKeyFromBase58(address)
	if err != nil {
		return nil, errors.New("wrong address")
	}
	balance, err := s.client.GetBalance(ctx, pk, rpc.CommitmentConfirmed)
	if err != nil {
		return nil, err
	}
	rawAmount := decimal.NewFromBigInt(new(big.Int).SetUint64(balance.Value), 0)
	solPrice, _ := pricefetcher.G().GetPrice(ctx, pricefetcher.SolanaMintWrapped)
	t := &Token{
		Name:    "Solana",
		Symbol:  "SOL",
		Logo:    "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
		Price:   solPrice,
		Chain:   chain.Solana,
		Address: solana.SystemProgramID.String(),
		Balance: Balance{
			RawAmount: rawAmount,
			UiAmount:  rawAmount.Shift(-9),
			Decimals:  9,
		}}
	return t, nil
}

func (s *SolanaFetcher) getTokensOwnedBy(ctx context.Context, address string) ([]Token, error) {
	res, err := fetchHeliusAllToken(ctx, address)
	if err != nil {
		return nil, err
	}
	tokens := make([]Token, 0)
	for _, item := range res {
		t := Token{
			Name:    item.Content.Metadata.Name,
			Address: item.ID,
			Chain:   chain.Solana,
			Symbol:  item.Content.Metadata.Symbol,
			Logo:    item.Content.Links.Image,
			Price:   item.TokenInfo.PriceInfo.PricePerToken,
			Balance: Balance{
				RawAmount: item.TokenInfo.Balance,
				UiAmount:  item.TokenInfo.Balance.Shift(-int32(item.TokenInfo.Decimals)),
				Decimals:  item.TokenInfo.Decimals,
			},
		}
		tokens = append(tokens, t)
		go s.storeToken(&token.Token{
			Address:  item.ID,
			Symbol:   item.Content.Metadata.Symbol,
			Name:     item.Content.Metadata.Name,
			Decimals: item.TokenInfo.Decimals,
			Logo:     item.Content.Links.Image,
			Chain:    chain.Solana,
		})
	}
	return tokens, nil
}

func (s *SolanaFetcher) storeToken(t *token.Token) error {
	//TODO make it better later
	return s.store.Create(t)
}
