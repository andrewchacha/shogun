package historyfetch

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"shogun/internal/model/chain"
	"shogun/internal/model/transaction"
	"shogun/internal/model/user"
	"shogun/internal/services/tokenstore"
	"shogun/internal/services/usercache"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/rs/zerolog/log"
	"github.com/shopspring/decimal"
)

var openingAccountCostLamports = decimal.NewFromFloat(2039280)

type SolanaHeliusFetcher struct {
	apiKey    string
	client    *http.Client
	store     tokenstore.Store
	userCache usercache.SimpleCache
}

func NewSolanaHeliusFetcher(apiKey string, store tokenstore.Store, userCache usercache.SimpleCache) *SolanaHeliusFetcher {
	return &SolanaHeliusFetcher{
		apiKey: apiKey,
		client: &http.Client{
			Timeout: 20 * time.Second,
		},
		store:     store,
		userCache: userCache,
	}
}

var heliusTypesMap = map[string]transaction.Type{
	"TRANSFER": transaction.TypeTransfer,
	"SWAP":     transaction.TypeSwap,
}

func (s *SolanaHeliusFetcher) Fetch(ctx context.Context, address string) ([]transaction.Transaction, error) {
	query := url.Values{}
	query.Set("api-key", s.apiKey)
	query.Set("limit", "100")

	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("https://api.helius.xyz/v0/addresses/%s/transactions?"+query.Encode(), address), nil)
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	res, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}

	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	history := make([]heliusHistoryRes, 0)
	err = json.Unmarshal(body, &history)
	if err != nil {
		log.Err(err).Msg(string(body))
		return nil, err
	}

	txs := make([]transaction.Transaction, 0, len(history))
	for _, h := range history {
		_type, exists := heliusTypesMap[h.Type]
		if !exists {
			_type = transaction.TypeUnknown
		}
		fromAddress := h.FeePayer
		toAddress := ""
		incoming := make([]transaction.Transfer, 0)
		outgoing := make([]transaction.Transfer, 0)

		var otherUser *user.Simple

		if _type == transaction.TypeTransfer {
			for _, t := range h.NativeTransfers {
				if h.Source == "SOLANA_PROGRAM_LIBRARY" && t.Amount.Equals(openingAccountCostLamports) {
					continue
				}
				if t.FromUserAccount == address {
					fromAddress = address
					toAddress = t.ToUserAccount
					outgoing = append(outgoing, s.makeTransfer(t.Amount.Shift(-9), 9, solana.SystemProgramID.String()))
				}
				if t.ToUserAccount == address {
					fromAddress = t.FromUserAccount
					toAddress = address
					incoming = append(incoming, s.makeTransfer(t.Amount.Shift(-9), 9, solana.SystemProgramID.String()))
				}
			}
			for _, t := range h.TokenTransfers {
				if t.FromUserAccount == address {
					fromAddress = address
					toAddress = t.ToUserAccount
					outgoing = append(outgoing, s.makeTransfer(t.TokenAmount, h.getTokenDecimals(t.Mint), t.Mint))
				}
				if t.ToUserAccount == address {
					fromAddress = t.FromUserAccount
					toAddress = address
					incoming = append(incoming, s.makeTransfer(t.TokenAmount, h.getTokenDecimals(t.Mint), t.Mint))
				}
			}
			var otherUserAddress string
			if fromAddress == address {
				otherUserAddress = toAddress
			} else {
				otherUserAddress = fromAddress
			}
			if otherUserAddress != "" {
				otherUser, _ = s.userCache.GetByAddress(otherUserAddress, chain.Solana)
			}
		}
		if _type == transaction.TypeSwap {
			swap := h.Events.Swap
			if input := swap.NativeInput; input != nil {
				tr := s.makeTransfer(input.Amount.Shift(-9), 9, solana.SystemProgramID.String())
				if input.Account == address {
					outgoing = append(outgoing, tr)
				} else {
					incoming = append(incoming, tr)
				}
			}
			if output := swap.NativeOutput; output != nil {
				tr := s.makeTransfer(output.Amount.Shift(-9), 9, solana.SystemProgramID.String())
				if output.Account == address {
					incoming = append(incoming, tr)
				} else {
					outgoing = append(outgoing, tr)
				}
			}
			for _, t := range swap.TokenInputs {
				tr := s.makeTransfer(t.RawTokenAmount.TokenAmount.Shift(-t.RawTokenAmount.Decimals), t.RawTokenAmount.Decimals, t.Mint)
				if t.UserAccount == address {
					outgoing = append(outgoing, tr)
				} else {
					incoming = append(incoming, tr)
				}
			}
			for _, t := range swap.TokenOutputs {
				tr := s.makeTransfer(t.RawTokenAmount.TokenAmount.Shift(-t.RawTokenAmount.Decimals), t.RawTokenAmount.Decimals, t.Mint)
				if t.UserAccount == address {
					incoming = append(incoming, tr)
				} else {
					outgoing = append(outgoing, tr)
				}
			}
		}

		changes := make([]transaction.Transfer, 0, len(incoming)+len(outgoing))
		changes = append(changes, incoming...)

		for _, t := range outgoing {
			t.UIAmount = t.UIAmount.Neg()
			found := false
			for i := range changes {
				c := &changes[i]
				if c.Address == t.Address {
					*c = c.Add(&t)
					found = true
					break
				}
			}
			if !found {
				changes = append(changes, t)
			}
		}

		txs = append(txs, transaction.Transaction{
			Type:        _type,
			Signature:   h.Signature,
			FromAddress: fromAddress,
			ToAddress:   toAddress,
			Timestamp:   h.Timestamp,
			Fee: transaction.Fee{
				Symbol: "SOL",
				Amount: h.Fee.Shift(-9),
			},
			Changes: changes,
			Failed:  h.TransactionError != nil,
			User:    otherUser,
		})
	}

	return txs, nil
}

func (s *SolanaHeliusFetcher) makeTransfer(uiAmount decimal.Decimal, decimals int32, mint string) transaction.Transfer {
	tr := transaction.Transfer{
		UIAmount: uiAmount,
	}
	if t, _ := s.store.Get(mint, chain.Solana); t != nil {
		tr.Token = *t
	} else {
		tr.Token.Decimals = int(decimals)
		tr.Token.Address = mint
	}
	return tr
}

type heliusHistoryRes struct {
	Description    string          `json:"description"`
	Type           string          `json:"type"`
	Source         string          `json:"source"`
	Fee            decimal.Decimal `json:"fee"`
	FeePayer       string          `json:"feePayer"`
	Signature      string          `json:"signature"`
	Slot           int64           `json:"slot"`
	Timestamp      int64           `json:"timestamp"`
	TokenTransfers []struct {
		FromTokenAccount string          `json:"fromTokenAccount"`
		ToTokenAccount   string          `json:"toTokenAccount"`
		FromUserAccount  string          `json:"fromUserAccount"`
		ToUserAccount    string          `json:"toUserAccount"`
		TokenAmount      decimal.Decimal `json:"tokenAmount"`
		Mint             string          `json:"mint"`
		TokenStandard    string          `json:"tokenStandard"`
	} `json:"tokenTransfers"`
	NativeTransfers []struct {
		FromUserAccount string          `json:"fromUserAccount"`
		ToUserAccount   string          `json:"toUserAccount"`
		Amount          decimal.Decimal `json:"amount"`
	} `json:"nativeTransfers"`
	AccountData []struct {
		Account             string          `json:"account"`
		NativeBalanceChange decimal.Decimal `json:"nativeBalanceChange"`
		TokenBalanceChanges []struct {
			UserAccount    string `json:"userAccount"`
			TokenAccount   string `json:"tokenAccount"`
			RawTokenAmount struct {
				TokenAmount string `json:"tokenAmount"`
				Decimals    int32  `json:"decimals"`
			} `json:"rawTokenAmount"`
			Mint string `json:"mint"`
		} `json:"tokenBalanceChanges"`
	} `json:"accountData"`
	TransactionError interface{} `json:"transactionError"`
	Instructions     []struct {
		Accounts          []string `json:"accounts"`
		Data              string   `json:"data"`
		ProgramId         string   `json:"programId"`
		InnerInstructions []struct {
			Accounts  []string `json:"accounts"`
			Data      string   `json:"data"`
			ProgramId string   `json:"programId"`
		} `json:"innerInstructions"`
	} `json:"instructions"`
	Events struct {
		Compressed []struct {
			Type                  string      `json:"type"`
			TreeId                string      `json:"treeId"`
			LeafIndex             int         `json:"leafIndex"`
			Seq                   int         `json:"seq"`
			AssetId               string      `json:"assetId"`
			InstructionIndex      int         `json:"instructionIndex"`
			InnerInstructionIndex interface{} `json:"innerInstructionIndex"`
			NewLeafOwner          string      `json:"newLeafOwner"`
			OldLeafOwner          interface{} `json:"oldLeafOwner"`
			NewLeafDelegate       string      `json:"newLeafDelegate"`
			OldLeafDelegate       interface{} `json:"oldLeafDelegate"`
			TreeDelegate          string      `json:"treeDelegate"`
			Metadata              struct {
				Name                 string `json:"name"`
				Symbol               string `json:"symbol"`
				Uri                  string `json:"uri"`
				SellerFeeBasisPoints int    `json:"sellerFeeBasisPoints"`
				PrimarySaleHappened  bool   `json:"primarySaleHappened"`
				IsMutable            bool   `json:"isMutable"`
				EditionNonce         int    `json:"editionNonce,omitempty"`
				TokenStandard        string `json:"tokenStandard"`
				Collection           struct {
					Key      string `json:"key"`
					Verified bool   `json:"verified"`
				} `json:"collection,omitempty"`
				TokenProgramVersion string `json:"tokenProgramVersion"`
				Creators            []struct {
					Address  string `json:"address"`
					Verified bool   `json:"verified"`
					Share    int    `json:"share"`
				} `json:"creators"`
			} `json:"metadata"`
			UpdateArgs interface{} `json:"updateArgs"`
		} `json:"compressed,omitempty"`
		Swap struct {
			NativeInput *struct {
				Account string          `json:"account"`
				Amount  decimal.Decimal `json:"amount"`
			} `json:"nativeInput"`
			NativeOutput *struct {
				Account string          `json:"account"`
				Amount  decimal.Decimal `json:"amount"`
			} `json:"nativeOutput"`
			TokenInputs []struct {
				UserAccount    string `json:"userAccount"`
				TokenAccount   string `json:"tokenAccount"`
				RawTokenAmount struct {
					TokenAmount decimal.Decimal `json:"tokenAmount"`
					Decimals    int32           `json:"decimals"`
				} `json:"rawTokenAmount"`
				Mint string `json:"mint"`
			} `json:"tokenInputs"`
			TokenOutputs []struct {
				UserAccount    string `json:"userAccount"`
				TokenAccount   string `json:"tokenAccount"`
				RawTokenAmount struct {
					TokenAmount decimal.Decimal `json:"tokenAmount"`
					Decimals    int32           `json:"decimals"`
				} `json:"rawTokenAmount"`
				Mint string `json:"mint"`
			} `json:"tokenOutputs"`
			NativeFees []interface{} `json:"nativeFees"`
			TokenFees  []interface{} `json:"tokenFees"`
			InnerSwaps []struct {
				TokenInputs []struct {
					FromTokenAccount string  `json:"fromTokenAccount"`
					ToTokenAccount   string  `json:"toTokenAccount"`
					FromUserAccount  string  `json:"fromUserAccount"`
					ToUserAccount    string  `json:"toUserAccount"`
					TokenAmount      float64 `json:"tokenAmount"`
					Mint             string  `json:"mint"`
					TokenStandard    string  `json:"tokenStandard"`
				} `json:"tokenInputs"`
				TokenOutputs []struct {
					FromTokenAccount string  `json:"fromTokenAccount"`
					ToTokenAccount   string  `json:"toTokenAccount"`
					FromUserAccount  string  `json:"fromUserAccount"`
					ToUserAccount    string  `json:"toUserAccount"`
					TokenAmount      float64 `json:"tokenAmount"`
					Mint             string  `json:"mint"`
					TokenStandard    string  `json:"tokenStandard"`
				} `json:"tokenOutputs"`
				TokenFees   []interface{} `json:"tokenFees"`
				NativeFees  []interface{} `json:"nativeFees"`
				ProgramInfo struct {
					Source          string `json:"source"`
					Account         string `json:"account"`
					ProgramName     string `json:"programName"`
					InstructionName string `json:"instructionName"`
				} `json:"programInfo"`
			} `json:"innerSwaps"`
		} `json:"swap,omitempty"`
	} `json:"events"`
}

func (h heliusHistoryRes) getTokenDecimals(mint string) int32 {
	for _, t := range h.AccountData {
		for _, tb := range t.TokenBalanceChanges {
			if tb.Mint == mint {
				return tb.RawTokenAmount.Decimals
			}
		}
	}
	return 0
}
