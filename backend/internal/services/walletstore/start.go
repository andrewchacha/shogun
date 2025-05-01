package walletstore

import (
	"context"
	"errors"
	"shogun/config"
	"shogun/internal/model/chain"
	"shogun/internal/services/tokenstore"

	"github.com/block-vision/sui-go-sdk/sui"
	"github.com/gagliardetto/solana-go/rpc"
)

var walletServices map[chain.Chain]Fetcher

var ErrorChainNotSupported = errors.New("chain not supported")

func Init(store tokenstore.Store) {
	solanaRPC := rpc.New(config.Cfg.SolanaRPC)
	suiRPC := sui.NewSuiClient(config.Cfg.SuiRPC)

	walletServices = map[chain.Chain]Fetcher{
		chain.Solana: NewSolanaWalletService(solanaRPC, store),
		chain.Sui:    NewSuiWalletService(suiRPC, store),
	}
}

func GetCoinsOwnedBy(ctx context.Context, address string, chain chain.Chain) (*CoinsOwned, error) {
	service, ok := walletServices[chain]
	if !ok {
		return nil, ErrorChainNotSupported
	}
	return service.CoinsOwnedBy(ctx, address)
}
