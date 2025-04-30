package v1

import (
	"errors"
	"fmt"
	"shogun/internal/api/response"
	"shogun/internal/model/chain"
	"shogun/internal/model/user"
	"shogun/internal/services/userstore"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/labstack/echo/v4"
)

type existsQueryParams struct {
	Timestamp int64  `query:"timestamp"`
	Signature string `query:"signature"`
}

type existsResponse struct {
	Exists bool `json:"exists"`
	user.Simple
}

func (ac *AuthController) Exists(e echo.Context) error {
	//user must sign /auth/exists/address?timestamp=<timestamp> with their private key
	//to check if they exist in the system, reason is some users turn off search on their
	//accounts and when importing key back to the app, we need to check if they exist
	address := e.Param("address")
	queryParams := &existsQueryParams{}
	err := e.Bind(queryParams)
	if err != nil {
		return response.BadRequestError(e, "")
	}
	signature, err := solana.SignatureFromBase58(queryParams.Signature)
	if err != nil {
		return response.BadRequestError(e, "signature is required")
	}
	publicKey, err := solana.PublicKeyFromBase58(address)
	if err != nil {
		return response.BadRequestError(e, "invalid address")
	}

	if time.Since(time.UnixMilli(queryParams.Timestamp)).Seconds() > 15 {
		return response.BadRequestError(e, "request expired")
	}

	msg := []byte(fmt.Sprintf("/auth/exists/%s?timestamp=%d", address, queryParams.Timestamp))
	isVerified := publicKey.Verify(msg, signature)
	if !isVerified {
		return response.BadRequestError(e, "signature verification failed")
	}

	userSimple, err := ac.userService.GetSimpleOwnerOfAddress(publicKey.String(), chain.Solana)
	if err != nil {
		if errors.Is(err, userstore.ErrorUserNotFound) {
			return response.JSON(e, &existsResponse{Exists: false})
		}
		return response.ServerError(e, err, "")
	}

	res := &existsResponse{
		Exists: true,
		Simple: *userSimple,
	}
	return response.JSON(e, res)
}
