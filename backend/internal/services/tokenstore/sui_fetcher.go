package tokenstore

import (
	"context"
	"shogun/config"
	"shogun/internal/model/chain"
	"shogun/internal/model/token"
	"time"

	"github.com/block-vision/sui-go-sdk/models"
	"github.com/block-vision/sui-go-sdk/sui"
)

type SuiFetcher struct {
	rpc sui.ISuiAPI
}

func NewSuiTokenFetcher() *SuiFetcher {
	return &SuiFetcher{
		rpc: sui.NewSuiClient(config.Cfg.SuiRPC),
	}
}

func (s *SuiFetcher) Fetch(address string) (*token.Token, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	rsp, err := s.rpc.SuiXGetCoinMetadata(ctx, models.SuiXGetCoinMetadataRequest{
		CoinType: address,
	})
	if err != nil {
		return nil, err
	}
	return &token.Token{
		Address:  address,
		Symbol:   rsp.Symbol,
		Name:     rsp.Name,
		Chain:    chain.Sui,
		Decimals: rsp.Decimals,
		Logo:     rsp.IconUrl,
		Meta: token.Meta{
			SuiObjectID: rsp.Id,
		},
	}, nil
}
