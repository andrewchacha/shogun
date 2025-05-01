package main

import (
	"shogun/config"
	"shogun/internal/api"
	"shogun/internal/data"
	"shogun/internal/model/chain"
	"shogun/internal/services/fileuploader"
	"shogun/internal/services/historyfetch"
	"shogun/internal/services/natsclient"
	"shogun/internal/services/pricefetcher"
	"shogun/internal/services/siglocker"
	"shogun/internal/services/tokenstore"
	"shogun/internal/services/usercache"
	"shogun/internal/services/userinfosync"
	"shogun/internal/services/userstore"
	"shogun/internal/services/walletstore"

	"github.com/dreson4/graceful/v2"
	"github.com/rs/zerolog/log"
)

func init() {
	config.Init()
	initGlobalLogger()
}

func main() {
	log.Info().Msg("shogun is starting...")
	db := data.Init(config.Cfg.PostgresURL)
	nats, _ := natsclient.Init(config.Cfg.ServerID, config.Cfg.NatsUrl)
	sigChecker := siglocker.NewHandler(nats)
	userStore := userstore.NewSqlStore(db)
	userInfoSync := userinfosync.NewNats(nats)
	userCache := usercache.NewLruCache(userStore, userInfoSync)

	storage := tokenstore.Init(
		db,
		map[chain.Chain]tokenstore.Fetcher{
			chain.Sui:    tokenstore.NewSuiTokenFetcher(),
			chain.Solana: tokenstore.NewSolanaHelius(config.Cfg.SolanaHeliusApiKey),
		},
		fileuploader.NewUploaderService())

	historyFetcher := historyfetch.NewAllChainFetcher(
		map[chain.Chain]historyfetch.ChainFetcher{
			chain.Solana: historyfetch.NewSolanaHeliusFetcher(config.Cfg.SolanaHeliusApiKey, storage, userCache),
			chain.Sui:    historyfetch.NewSuiFetcher(config.Cfg.SuiRPC, storage, userCache),
		})

	walletstore.Init(storage)
	pricefetcher.StartAll()

	params := &api.ConfigParams{
		DB:             db,
		Mode:           config.Cfg.Mode,
		SigChecker:     sigChecker,
		TokenStore:     storage,
		UserStore:      userStore,
		UserCache:      userCache,
		HistoryFetcher: historyFetcher,
	}
	apiServer := api.Init(params)
	go func() {
		log.Info().Msg("starting server on port " + config.Cfg.Port)
		log.Fatal().Err(apiServer.Start(":" + config.Cfg.Port)).Send()
	}()

	graceful.Initialize()
	graceful.Wait()
}
