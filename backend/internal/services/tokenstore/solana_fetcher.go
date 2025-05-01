package tokenstore

import (
	"shogun/config"
	"shogun/internal/model/token"

	"github.com/gagliardetto/solana-go/rpc"
)

type SolanaChain struct {
	rpc *rpc.Client
}

func NewSolanaChain() *SolanaChain {
	return &SolanaChain{
		rpc: rpc.New(config.Cfg.SolanaRPC),
	}
}

func (f *SolanaChain) Fetch(address string) (*token.Token, error) {
	//Nothing here yet, we do get all the token data for now from helius
	return nil, nil
}
