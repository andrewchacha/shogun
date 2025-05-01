package natsclient

import (
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"github.com/rs/zerolog/log"
)

func Init(id, natsUrl string) (*nats.Conn, jetstream.JetStream) {
	nc, err := nats.Connect(natsUrl,
		nats.Name(id),
		nats.PingInterval(15*time.Second),
		nats.Compression(true),
	)
	if err != nil {
		log.Fatal().Err(err).Msg("error initializing nats")
	}
	js, err := jetstream.New(nc)
	if err != nil {
		log.Fatal().Err(err).Msg("error initializing jetstream")
	}
	return nc, js
}
