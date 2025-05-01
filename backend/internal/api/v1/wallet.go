package v1

import (
	"errors"
	"shogun/internal/api/response"
	"shogun/internal/model/chain"
	"shogun/internal/services/historyfetch"
	"shogun/internal/services/walletstore"
	"sort"

	"github.com/labstack/echo/v4"
)

type WalletController struct {
	fetcher historyfetch.AllFetcher
}

func NewWalletController(fetcher historyfetch.AllFetcher) *WalletController {
	return &WalletController{
		fetcher: fetcher,
	}
}

type fetchAssetsQuery struct {
	Address string      `query:"address" validate:"required"`
	Chain   chain.Chain `query:"chain" validate:"required"`
}

func (wc *WalletController) FetchAssets(e echo.Context) error {
	var query fetchAssetsQuery
	if err := e.Bind(&query); err != nil {
		return response.BadRequestError(e, "address and chain params are required")
	}
	if err := e.Validate(query); err != nil {
		return response.BadRequestError(e, err.Error())
	}

	assets, err := walletstore.GetCoinsOwnedBy(e.Request().Context(), query.Address, query.Chain)
	if err != nil {
		switch {
		case errors.Is(err, walletstore.ErrorChainNotSupported):
			return response.OtherErrors(e, response.ErrorChainNotSupportedForAction, "chain not supported for this action")
		default:
			return response.ServerError(e, err, "failed to fetch assets")
		}
	}

	assets.SetUSDValue()
	sort.Slice(assets.Tokens, func(i, j int) bool {
		return assets.Tokens[i].Total.GreaterThan(assets.Tokens[j].Total)
	})

	return response.JSON(e, assets)
}

type fetchHistoryQuery struct {
	Address string      `query:"address" validate:"required"`
	Chain   chain.Chain `query:"chain" validate:"required"`
}

func (wc *WalletController) FetchHistory(e echo.Context) error {
	var query fetchHistoryQuery
	if err := e.Bind(&query); err != nil {
		return response.BadRequestError(e, "address and chain params are required")
	}
	if err := e.Validate(query); err != nil {
		return response.BadRequestError(e, err.Error())
	}
	history, err := wc.fetcher.Fetch(e.Request().Context(), query.Address, query.Chain)
	if err != nil {
		switch {
		case errors.Is(err, historyfetch.ErrorChainNotSupported):
			return response.OtherErrors(e, response.ErrorChainNotSupportedForAction, "chain not supported for this action")
		default:
			return response.ServerError(e, err, "failed to fetch history")
		}
	}
	return response.JSON(e, history)
}
