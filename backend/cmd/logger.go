package main

import (
	"fmt"
	"os"
	"shogun/config"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func initGlobalLogger() {
	if config.Cfg.IsRelease() {
		log.Logger = zerolog.New(os.Stderr).With().Timestamp().Logger()
	} else {
		log.Logger = zerolog.New(zerolog.ConsoleWriter{
			Out:        os.Stderr,
			TimeFormat: time.Kitchen,
			FormatMessage: func(i interface{}) string {
				if i == nil || i == "" {
					return ""
				}
				return fmt.Sprintf("\n%s\n", i)
			},
		}).
			Level(zerolog.TraceLevel).
			With().
			Timestamp().
			Caller().
			Logger()
	}
}
