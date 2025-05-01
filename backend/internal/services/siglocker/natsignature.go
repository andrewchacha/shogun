package siglocker

import (
	"sync"
	"time"

	"github.com/dreson4/graceful/v2"
	"github.com/nats-io/nats.go"
	"github.com/patrickmn/go-cache"
	"github.com/rs/zerolog/log"
)

const (
	signatureSubject = "server.signatures"
	signatureTTL     = 15 * time.Second
)

// Handler - handles updates of all used signatures to prevent
// replay attack, every used signature is shared right away to other
// api servers, that way
type Handler struct {
	natsClient     *nats.Conn
	isListening    bool
	UsedSignatures *cache.Cache
	mu             sync.Mutex
}

func NewHandler(client *nats.Conn) *Handler {
	return &Handler{
		natsClient:     client,
		UsedSignatures: cache.New(signatureTTL, 1*time.Minute),
	}
}

func (sh *Handler) listen() {
	sh.mu.Lock()
	defer sh.mu.Unlock()
	if sh.isListening {
		return
	}
	sh.isListening = true

	sub, err := sh.natsClient.Subscribe(signatureSubject, func(msg *nats.Msg) {
		signature := string(msg.Data)
		sh.UsedSignatures.Set(signature, struct{}{}, signatureTTL)
	})
	if err != nil {
		log.Fatal().Msg("failed to listen for signatures on nats")
	}
	graceful.OnShutdown(func() {
		_ = sub.Unsubscribe()
	})
}

func (sh *Handler) Notify(signature string) error {
	sh.UsedSignatures.Set(signatureSubject, struct{}{}, signatureTTL)
	return sh.natsClient.Publish(signatureSubject, []byte(signature))
}

func (sh *Handler) IsSignatureUsed(signature string) bool {
	_, found := sh.UsedSignatures.Get(signature)
	return found
}
