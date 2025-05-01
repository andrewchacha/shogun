package walletstore

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"shogun/config"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/shopspring/decimal"
)

type heliusGetTokenRes struct {
	Jsonrpc string `json:"jsonrpc"`
	Result  struct {
		Total         int               `json:"total"`
		Limit         int               `json:"limit"`
		Page          int               `json:"page"`
		TokenAccounts []heliusTokenItem `json:"items"`
	} `json:"result"`
	Id string `json:"id"`
}

type heliusTokenItem struct {
	ID      string `json:"id"`
	Content struct {
		Schema  string `json:"$schema"`
		JsonUri string `json:"json_uri"`
		Files   []struct {
			Uri    string `json:"uri"`
			CdnUri string `json:"cdn_uri"`
			Mime   string `json:"mime"`
		} `json:"files"`
		Metadata struct {
			Description   string `json:"description"`
			Name          string `json:"name"`
			Symbol        string `json:"symbol"`
			TokenStandard string `json:"token_standard"`
		} `json:"metadata"`
		Links struct {
			Image string `json:"image"`
		} `json:"links"`
	} `json:"content"`
	TokenInfo struct {
		Symbol                 string          `json:"symbol,omitempty"`
		Balance                decimal.Decimal `json:"balance"`
		Supply                 decimal.Decimal `json:"supply"`
		Decimals               int             `json:"decimals"`
		TokenProgram           string          `json:"token_program"`
		AssociatedTokenAddress string          `json:"associated_token_address"`
		PriceInfo              struct {
			PricePerToken decimal.Decimal `json:"price_per_token"`
			TotalPrice    decimal.Decimal `json:"total_price"`
			Currency      string          `json:"currency"`
		} `json:"price_info,omitempty"`
		MintAuthority string `json:"mint_authority,omitempty"`
	} `json:"token_info"`
}

func fetchHeliusAllToken(ctx context.Context, address string) ([]heliusTokenItem, error) {
	params := map[string]interface{}{
		"jsonrpc": "2.0",
		"id":      "string",
		"method":  "searchAssets",
		"params": map[string]interface{}{
			"ownerAddress": address,
			"tokenType":    "fungible",
			"page":         1,
			"limit":        1000,
		},
		"displayOptions": map[string]interface{}{
			"showZeroBalance": true,
			"showFungible":    true,
		},
	}
	jsonBody, _ := json.Marshal(params)
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	req, err := http.NewRequestWithContext(ctx, "POST", config.Cfg.SolanaRPC, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	data := &heliusGetTokenRes{}
	err = json.Unmarshal(body, data)
	if err != nil {
		return nil, errors.New(string(body))
	}
	return data.Result.TokenAccounts, nil
}
