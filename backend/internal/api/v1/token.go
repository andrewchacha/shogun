package v1

import (
	"shogun/internal/api/response"
	"shogun/internal/model/chain"
	"shogun/internal/services/pricefetcher"
	"shogun/internal/services/tokenstore"

	"github.com/labstack/echo/v4"
)

type TokenController struct {
	storage tokenstore.Store
	price   pricefetcher.Fetcher
}

func NewTokenController(storage tokenstore.Store, price pricefetcher.Fetcher) *TokenController {
	return &TokenController{
		storage: storage,
		price:   price,
	}
}

func (t *TokenController) TokenInfoGET(e echo.Context) error {
	address := e.Param("address")
	network := e.QueryParam("chain")
	token, err := t.storage.Get(address, chain.Chain(network))
	if err != nil {
		return response.ServerError(e, err, "failed to fetch token")
	}
	return response.JSON(e, token)
}

func (t *TokenController) TokenPriceGET(e echo.Context) error {
	address := e.Param("address")
	price, err := t.price.GetPrice(e.Request().Context(), address)
	if err != nil {
		return response.ServerError(e, err, "failed to fetch price")
	}
	return response.JSON(e, map[string]interface{}{
		"price": price,
	})
}
