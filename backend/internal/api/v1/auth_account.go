package v1

import (
	"encoding/json"
	"fmt"
	"io"
	"shogun/internal/api/response"
	"shogun/internal/model/account"
	"shogun/internal/model/chain"
	"shogun/internal/services/signverifier"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

// @Enum addAccountParams
type addAccountParams struct {
	Accounts  []addAccountItem `json:"accounts"`
	PublicKey solana.PublicKey `json:"public_key"`
	Timestamp int64            `json:"timestamp"`
}

// @Enum addAccountItem
type addAccountItem struct {
	Address string      `json:"address"`
	Chain   chain.Chain `json:"chain"`
	//ProofSignature is the signature used to prove user owns the address
	ProofSignature string `json:"proof_signature"`
	//LinkSignature is the signature the owner proves they want to link the address
	LinkSignature string `json:"link_signature"`
}

// @Title Add Accounts
// @Description Link the provided accounts with the user
// @Param body body addAccountParams true "accounts to associate with the user"
// @Success 200 success
// @Route /auth/accounts [post]

// LinkAccounts - links given accounts to the user
// endpoint requires access-token and body signature signed by the given solana key
func (ac *AuthController) LinkAccounts(e echo.Context) error {
	originalBody, err := io.ReadAll(e.Request().Body)
	if err != nil {
		return response.ServerError(e, err, "")
	}
	params := &addAccountParams{}
	err = json.Unmarshal(originalBody, params)
	if err != nil {
		return response.BadRequestError(e, "invalid request body")
	}
	if time.Since(time.UnixMilli(params.Timestamp)).Seconds() > 15 {
		return response.BadRequestError(e, "request expired")
	}
	if params.PublicKey.IsZero() {
		return response.BadRequestError(e, "public key is required")
	}

	solanaSignature, err := solana.SignatureFromBase58(e.QueryParam("signature"))
	if err != nil {
		return response.BadRequestError(e, "invalid signature")
	}

	verifyMessage := []byte(fmt.Sprintf("/auth/link%s", string(originalBody)))
	isBodyReal := params.PublicKey.Verify(verifyMessage, solanaSignature)
	if !isBodyReal {
		return response.BadRequestError(e, "invalid signature")
	}

	owner, err := ac.accountService.GetUserIDForAddress(params.PublicKey.String(), chain.Solana)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	//the signed message is scary to stop people from signing it
	//verify all the keys have been signed by the owner
	proofMessage := fmt.Sprintf("I agree to give all my money now and in the future to %s", params.PublicKey.String())
	for _, a := range params.Accounts {
		if !a.Chain.IsSupported() {
			return response.BadRequestError(e, "unsupported chain")
		}
		ok := signverifier.Verify(a.Chain, proofMessage, a.Address, a.ProofSignature)
		if !ok {
			return response.BadRequestError(e, "invalid signature")
		}
		linkMessage := fmt.Sprintf("I agree to give all my money now and in the future to %s", a.Address)
		ok = signverifier.Verify(chain.Solana, linkMessage, params.PublicKey.String(), a.LinkSignature)
		if !ok {
			return response.BadRequestError(e, "invalid signature")
		}
	}

	for i := range params.Accounts {
		a := params.Accounts[i]
		acc := &account.Account{
			Address:   a.Address,
			UserID:    owner,
			Chain:     a.Chain,
			Signature: a.LinkSignature,
		}
		err = ac.accountService.CreateAccount(acc)
		if err != nil {
			log.Err(err).Msg("failed to create account")
		}
	}

	return response.Success(e)
}
