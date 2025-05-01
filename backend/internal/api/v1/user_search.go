package v1

import (
	"shogun/internal/api/response"
	"shogun/internal/model/account"
	"shogun/internal/model/chain"
	"shogun/internal/model/user"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
)

func (uc *UserController) GetPublicProfile(e echo.Context) error {
	var simple *user.Simple
	var err error
	if address := e.Param("address"); len(address) > 0 {
		simple, err = uc.userService.GetSimpleOwnerOfAddress(address, chain.Solana)
	} else if userID, _ := strconv.ParseInt(e.Param("id"), 10, 64); userID > 0 {
		simple, err = uc.userService.GetSimpleByID(userID)
	} else {
		return response.BadRequestError(e, "address or id required")
	}
	if err != nil {
		return response.ServerError(e, err, "")
	}
	return response.JSON(e, simple)
}

func (uc *UserController) GetManyAddresses(e echo.Context) error {
	addresses := strings.Split(e.QueryParam("addresses"), ",")
	if len(addresses) == 0 {
		return response.BadRequestError(e, "addresses is required")
	}
	if len(addresses) > 15 {
		return response.BadRequestError(e, "addresses is limited to 15 addresses")
	}
	c := e.QueryParam("chain")
	if len(c) == 0 {
		return response.BadRequestError(e, "chain is required")
	}

	res := make([]user.SimpleByAddress, 0)
	for _, address := range addresses {
		simple, err := uc.userService.GetSimpleOwnerOfAddress(address, chain.Chain(c))
		if err != nil {
			continue
		}
		res = append(res, user.SimpleByAddress{Address: address, Simple: *simple})
	}

	return response.JSON(e, res)
}

type getUsernameRes struct {
	user.Simple
	Accounts []account.Simple `json:"accounts"`
}

func (uc *UserController) GetUsername(e echo.Context) error {
	username := e.Param("username")
	if len(username) == 0 {
		return response.BadRequestError(e, "username is required")
	}
	//remove @ if exists
	if username[0] == '@' {
		username = username[1:]
	}
	simple, err := uc.userService.GetSimpleByUsername(username)
	if err != nil {
		return response.ServerError(e, err, "")
	}
	accounts, err := uc.accountService.GetSimpleByUserID(simple.ID)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	res := getUsernameRes{
		Simple:   *simple,
		Accounts: accounts,
	}
	return response.JSON(e, res)
}
