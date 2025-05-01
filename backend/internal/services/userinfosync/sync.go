package userinfosync

import (
	"encoding/json"
	"fmt"
	"shogun/internal/model/user"
	"strconv"
	"strings"

	"github.com/dreson4/graceful/v2"
	"github.com/nats-io/nats.go"
)

const (
	syncSubject = "user.update.sync"
)

type Service interface {
	Update(userID int64, simple user.Updatable) error
	Listen(callback func(int64, user.Updatable)) error
}

type Nats struct {
	conn *nats.Conn
}

func NewNats(conn *nats.Conn) *Nats {
	return &Nats{conn: conn}
}

func (n *Nats) Update(userID int64, simple user.Updatable) error {
	subject := fmt.Sprintf("%s.%d", syncSubject, userID)
	u, err := json.Marshal(simple)
	if err != nil {
		return err
	}
	return n.conn.Publish(subject, u)
}

func (n *Nats) Listen(callback func(int64, user.Updatable)) error {
	sub, err := n.conn.Subscribe(fmt.Sprintf("%s.>", syncSubject), func(msg *nats.Msg) {
		split := strings.Split(msg.Subject, ".")
		if len(split) != 4 {
			return
		}
		userID, _ := strconv.ParseInt(split[3], 10, 64)
		if userID == 0 {
			return
		}
		var u user.Updatable
		if err := json.Unmarshal(msg.Data, &u); err != nil {
			return
		}
		callback(userID, u)
	})
	if err != nil {
		return err
	}
	graceful.OnShutdown(func() {
		_ = sub.Unsubscribe()
	})
	return nil
}
