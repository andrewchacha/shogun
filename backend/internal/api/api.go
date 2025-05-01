package api

import (
	"net/http"
	"shogun/config"
	"shogun/internal/api/middleware/auth"
	"shogun/internal/api/middleware/ratelimiter"
	"shogun/internal/api/middleware/simplelog"
	v1 "shogun/internal/api/v1"
	"shogun/internal/services/accountstore"
	"shogun/internal/services/fileuploader"
	"shogun/internal/services/historyfetch"
	"shogun/internal/services/prefstore"
	"shogun/internal/services/pricefetcher"
	"shogun/internal/services/siglocker"
	"shogun/internal/services/tokenstore"
	"shogun/internal/services/usercache"
	"shogun/internal/services/userstore"

	"github.com/go-playground/validator/v10"
	"github.com/jmoiron/sqlx"
	"github.com/labstack/echo/v4"
)

type ConfigParams struct {
	DB             *sqlx.DB
	Mode           config.Mode
	SigChecker     siglocker.UseChecker
	TokenStore     tokenstore.Store
	UserStore      userstore.Store
	UserCache      usercache.SimpleCache
	HistoryFetcher historyfetch.AllFetcher
}

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

/*** Swagger API Documentation initialization ***/
// @Version 1.0
// @Title Shogun API
// @Description This is the API for Shogun Social, used for both Desktop and Mobile app.
// @ContactName Baraka Andrew
// @ContactEmail baraka@shogun.social
// @ContactURL http://someurl.oxox
// @TermsOfServiceUrl http://someurl.oxox
// @LicenseName Proprietary License
// @Server https://api.shogun.social
func Init(conf *ConfigParams) *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Use(ratelimiter.InitEchoLimiter())
	e.Any("/ping", func(c echo.Context) error {
		return c.String(http.StatusOK, "pong")
	})
	e.Use(simplelog.Logger)
	e.Validator = &CustomValidator{validator: validator.New()}

	group := e.Group("/v1")
	apiV1(group, conf)
	return e
}

// apiV1 - handles all v1 routes, grouped routes can stay in their own Routes struct
func apiV1(e *echo.Group, conf *ConfigParams) {
	accountService := accountstore.NewSqlStore(conf.DB)
	fileUploadService := fileuploader.NewUploaderService()
	preferenceService := prefstore.NewSqlStore(conf.DB)

	systemController := v1.NewSystemController()
	e.GET("/system", systemController.SystemGET)
	// Auth routes
	authController := v1.NewAuthController(
		conf.DB,
		accountService,
		conf.UserStore,
		preferenceService,
		conf.SigChecker,
	)

	e.GET("/auth/login", authController.LoginGET)
	e.GET("/auth/exists/:address", authController.Exists)
	e.POST("/auth/link", authController.LinkAccounts)

	// User routes
	userController := v1.NewUserController(
		conf.UserStore,
		accountService,
		fileUploadService,
		preferenceService,
		conf.UserCache,
	)
	e.GET("/user/profile", userController.GetPublicProfile)
	e.GET("/user/me", userController.GetMe, auth.Auth)
	e.POST("/user/update", userController.Update, auth.Auth)
	e.POST("/user/thumbnail", userController.UpdateThumbnail, auth.Auth)
	e.GET("/user/preferences", userController.GetPreferences, auth.Auth)
	e.POST("/user/preferences", userController.UpdatePreferences, auth.Auth)
	e.GET("/user/search/addresses", userController.GetManyAddresses, auth.Auth)
	e.GET("/user/search/username/:username", userController.GetUsername, auth.Auth)

	// Wallet routes
	walletController := v1.NewWalletController(conf.HistoryFetcher)
	e.GET("/wallet/assets", walletController.FetchAssets, auth.Auth)
	e.GET("/wallet/history", walletController.FetchHistory, auth.Auth)

	tokenController := v1.NewTokenController(conf.TokenStore, pricefetcher.G())
	e.GET("/token/info/:address", tokenController.TokenInfoGET, auth.Auth)
	e.GET("/token/price/:address", tokenController.TokenPriceGET, auth.Auth)
}
