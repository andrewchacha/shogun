package historyfetch

import (
	"context"
	"shogun/internal/model/chain"
	"shogun/internal/model/transaction"
	"shogun/internal/services/tokenstore"
	"shogun/internal/services/usercache"
	"sort"
	"strconv"
	"strings"

	"github.com/block-vision/sui-go-sdk/models"
	"github.com/block-vision/sui-go-sdk/sui"
	"github.com/rs/zerolog/log"
	"github.com/shopspring/decimal"
)

type SuiFetcher struct {
	cli       sui.ISuiAPI
	store     tokenstore.Store
	userCache usercache.SimpleCache
}

func NewSuiFetcher(rpcUrl string, store tokenstore.Store, userCache usercache.SimpleCache) *SuiFetcher {
	cli := sui.NewSuiClient(rpcUrl)
	return &SuiFetcher{
		cli:       cli,
		store:     store,
		userCache: userCache,
	}
}

func (s *SuiFetcher) Fetch(ctx context.Context, address string) ([]transaction.Transaction, error) {
	allTxs := make([]transaction.Transaction, 0, 100)
	sent, err := s.fetchWithFilter(ctx, map[string]interface{}{
		"FromAddress": address,
	})
	if err != nil {
		log.Err(err).Msg("failed to fetch sent history")
		return nil, err
	}
	doneTxs := make(map[string]struct{})
	for _, tx := range sent.Data {
		if _, ok := doneTxs[tx.Digest]; ok {
			continue
		}
		doneTxs[tx.Digest] = struct{}{}
		allTxs = append(allTxs, s.parseTx(&tx, address, true))
	}
	received, err := s.fetchWithFilter(ctx, map[string]interface{}{
		"ToAddress": address,
	})
	if err != nil {
		return allTxs, nil
	}
	for _, tx := range received.Data {
		if _, ok := doneTxs[tx.Digest]; ok {
			continue
		}
		doneTxs[tx.Digest] = struct{}{}
		allTxs = append(allTxs, s.parseTx(&tx, address, false))
	}

	sort.Slice(allTxs, func(i, j int) bool {
		return allTxs[i].Timestamp > allTxs[j].Timestamp
	})

	return allTxs, nil
}

func (s *SuiFetcher) parseTx(suiTx *models.SuiTransactionBlockResponse, address string, isFrom bool) transaction.Transaction {
	timestamp, _ := strconv.ParseInt(suiTx.TimestampMs, 10, 64)
	storageFee, _ := decimal.NewFromString(suiTx.Effects.GasUsed.StorageCost)
	storageRebate, _ := decimal.NewFromString(suiTx.Effects.GasUsed.StorageRebate)
	computationFee, _ := decimal.NewFromString(suiTx.Effects.GasUsed.ComputationCost)
	totalGas := computationFee.Add(storageFee).Sub(storageRebate)

	_type := transaction.TypeUnknown
	changes := make([]transaction.Transfer, 0)
	otherAddress := ""
	for _, b := range suiTx.BalanceChanges {
		if b.Owner.AddressOwner != address {
			otherAddress = b.Owner.AddressOwner
			continue
		}

		coinType := b.CoinType
		coinToken, err := s.store.Get(coinType, chain.Sui)
		//if err happens better not to show changes at all than show wrong data
		if err != nil {
			changes = make([]transaction.Transfer, 0)
			break
		}
		rawAmount, _ := decimal.NewFromString(b.Amount)
		changes = append(changes, transaction.Transfer{
			UIAmount: rawAmount.Shift(int32(-coinToken.Decimals)),
			Token:    *coinToken,
		})
		_type = transaction.TypeTransfer
	}
	if len(changes) > 1 {
		for _, e := range suiTx.Events {
			if strings.Contains(strings.ToLower(e.Type), "Swap") {
				_type = transaction.TypeSwap
				break
			}
		}
	}

	var fromAddress string
	var toAddress string

	if isFrom {
		fromAddress = address
		toAddress = otherAddress
	} else {
		fromAddress = otherAddress
		toAddress = address
	}
	otherUser, _ := s.userCache.GetByAddress(otherAddress, chain.Sui)
	tx := transaction.Transaction{
		Type:        _type,
		Signature:   suiTx.Digest,
		FromAddress: fromAddress,
		ToAddress:   toAddress,
		Timestamp:   timestamp,
		Fee: transaction.Fee{
			Amount: totalGas.Shift(-9),
			Symbol: "SUI",
		},
		Changes: changes,
		Failed:  !strings.EqualFold(suiTx.Effects.Status.Status, "success"),
		User:    otherUser,
	}
	return tx
}

func (s *SuiFetcher) fetchWithFilter(ctx context.Context, filter map[string]interface{}) (models.SuiXQueryTransactionBlocksResponse, error) {
	res, err := s.cli.SuiXQueryTransactionBlocks(ctx, models.SuiXQueryTransactionBlocksRequest{
		SuiTransactionBlockResponseQuery: models.SuiTransactionBlockResponseQuery{
			TransactionFilter: filter,
			Options: models.SuiTransactionBlockOptions{
				ShowInput:          true,
				ShowRawInput:       true,
				ShowEffects:        true,
				ShowEvents:         true,
				ShowObjectChanges:  true,
				ShowBalanceChanges: true,
			},
		},
		Cursor:          nil,
		Limit:           50,
		DescendingOrder: true,
	})
	return res, err
}
