package v1

import (
	"shogun/internal/services/accountstore"
	"shogun/internal/services/prefstore"
	"shogun/internal/services/siglocker"
	"shogun/internal/services/userstore"

	"github.com/jmoiron/sqlx"
)

type AuthController struct {
	accountService    accountstore.Store
	userService       userstore.Store
	preferenceService prefstore.Store
	signatureChecker  siglocker.UseChecker
	db                *sqlx.DB
}

func NewAuthController(
	db *sqlx.DB,
	accountService accountstore.Store,
	userService userstore.Store,
	preferenceService prefstore.Store,
	signatureChecker siglocker.UseChecker,
) *AuthController {
	return &AuthController{
		accountService:    accountService,
		userService:       userService,
		preferenceService: preferenceService,
		signatureChecker:  signatureChecker,
		db:                db,
	}
}
