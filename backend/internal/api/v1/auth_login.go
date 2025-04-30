package v1

import (
	"errors"
	"fmt"
	"shogun/internal/api/response"
	"shogun/internal/model/account"
	"shogun/internal/model/chain"
	"shogun/internal/model/preferences"
	"shogun/internal/model/user"
	"shogun/internal/security/accesstoken"
	"shogun/internal/services/accountstore"
	"shogun/internal/utils/randomname"
	"time"

	"github.com/gagliardetto/solana-go"
	"github.com/labstack/echo/v4"
)

type loginQueryParams struct {
	PublicKey string `query:"public_key"`
	Timestamp int64  `query:"timestamp"`
	Signature string `query:"signature"`
}

// @Enum loginSuccessResponse
type loginSuccessResponse struct {
	AccessToken string `json:"access_token"`
	IsNewUser   bool   `json:"is_new_user,omitempty"`
	ExpiresIn   int64  `json:"expires_in"`
}

// @Title User Login
// @Description Authenticates user based on the provided timestamp and signature, along with the required Solana public key in the headers.
// @Param timestamp query int64 true "Timestamp of the login request"
// @Param signature query string true "Signature for the login request"
// @Success 200 {object} loginSuccessResponse "User is successfully authenticated"
// @Route /auth/login [get]
func (ac *AuthController) LoginGET(e echo.Context) error {
	queryParams := &loginQueryParams{}
	err := e.Bind(queryParams)
	if err != nil {
		return response.BadRequestError(e, "")
	}
	if time.Since(time.UnixMilli(queryParams.Timestamp)).Seconds() > 15 {
		return response.BadRequestError(e, "request expired")
	}
	userPublicKey, err := solana.PublicKeyFromBase58(queryParams.PublicKey)
	if err != nil {
		return response.BadRequestError(e, "solana public key is required")
	}
	signature, err := solana.SignatureFromBase58(queryParams.Signature)
	if err != nil {
		return response.BadRequestError(e, "signature is required")
	}
	if ac.signatureChecker.IsSignatureUsed(queryParams.Signature) {
		return response.BadRequestError(e, "signature expired")
	}
	//add it right away not to be used again, push it to nats too for other servers
	ac.signatureChecker.Notify(queryParams.Signature)

	signedMessage := []byte(fmt.Sprintf("/auth/login/%s?timestamp=%d", queryParams.PublicKey, queryParams.Timestamp))
	isValid := userPublicKey.Verify(signedMessage, signature)
	if !isValid {
		return response.UnauthorizedError(e)
	}

	isNewUser := false
	ownerID, err := ac.accountService.GetUserIDForAddress(userPublicKey.String(), chain.Solana)
	if err != nil && !errors.Is(err, accountstore.ErrorAccountNotFound) {
		return response.ServerError(e, err, "")
	}
	if errors.Is(err, accountstore.ErrorAccountNotFound) {
		isNewUser = true
		ownerID, err = ac.createNewUser(userPublicKey)
	}
	if err != nil {
		return response.ServerError(e, err, "")
	}
	if ownerID == 0 {
		return response.ServerError(e, errors.New("owner id is zero"), "")
	}

	token, expiresAt := accesstoken.GenerateTokenForUser(ownerID)
	return response.JSON(e, loginSuccessResponse{
		AccessToken: token,
		ExpiresIn:   expiresAt - time.Now().Unix(), // in seconds
		IsNewUser:   isNewUser,
	})
}

func (ac *AuthController) createNewUser(solanaPublicKey solana.PublicKey) (int64, error) {
	tx, err := ac.db.Beginx()
	if err != nil {
		return 0, err
	}

	username, err := randomname.GenerateRandomUsername()
	if err != nil {
		return 0, err
	}
	u := user.New()
	u.Username = username
	u.CreatedAt = time.Now()
	u.UpdatedAt = u.CreatedAt
	err = ac.userService.CreateUserNoCommit(tx, u)
	if err != nil {
		_ = tx.Rollback()
		return 0, err
	}
	if u.ID == 0 {
		_ = tx.Rollback()
		return 0, errors.New("user id is zero")
	}
	a := account.New()
	a.Address = solanaPublicKey.String()
	a.Chain = chain.Solana
	a.UserID = u.ID
	a.CreatedAt = time.Now()
	err = ac.accountService.CreateAccountNoCommit(tx, a)
	if err != nil {
		_ = tx.Rollback()
		return 0, err
	}

	pref := preferences.DefaultPreferences()
	err = ac.preferenceService.Create(u.ID, &pref)
	if err != nil {
		_ = tx.Rollback()
		return 0, err
	}

	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	return u.ID, nil
}
