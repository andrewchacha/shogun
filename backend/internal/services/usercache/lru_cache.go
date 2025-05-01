package usercache

import (
	"errors"
	"fmt"
	"reflect"
	"shogun/internal/model/chain"
	"shogun/internal/model/user"
	"shogun/internal/services/userinfosync"
	"shogun/internal/services/userstore"
	"time"

	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/patrickmn/go-cache"
	"github.com/rs/zerolog/log"
)

// TODO listen to nats for updates and invalidate cache

type LruCache struct {
	store    userstore.Store
	cache    *lru.Cache[string, *user.Simple]
	ignored  *cache.Cache // if user isn't found we ignore this user for a while
	userSync userinfosync.Service
}

func NewLruCache(store userstore.Store, userSync userinfosync.Service) *LruCache {
	c, err := lru.New[string, *user.Simple](1_000_000)
	if err != nil {
		log.Panic().Err(err).Msg("")
	}
	return &LruCache{
		store:    store,
		cache:    c,
		ignored:  cache.New(15*time.Minute, 15*time.Minute),
		userSync: userSync,
	}
}

func (c *LruCache) Init() {
	err := c.userSync.Listen(func(userID int64, simple user.Updatable) {
		u, e := c.cache.Get(fmt.Sprintf("id:%d", userID))
		if !e {
			return
		}
		existingUser := reflect.ValueOf(u)
		updatableValue := reflect.ValueOf(simple)
		updatableType := reflect.TypeOf(simple)
		for i := 0; i < updatableValue.NumField(); i++ {
			if updatableValue.Field(i).IsNil() {
				continue
			}
			field := updatableType.Field(i)
			existingField := existingUser.FieldByName(field.Name)
			if existingField.IsValid() {
				existingField.Set(updatableValue.Field(i))
			}
		}
	})
	if err != nil {
		log.Fatal().Err(err).Msg("failed to listen for user updates")
	}
}

func (c *LruCache) GetByAddress(address string, chain chain.Chain) (*user.Simple, error) {
	ck := fmt.Sprintf("address:%s:%s", address, chain)
	if _, ok := c.ignored.Get(ck); ok {
		return nil, ErrorUserNotFound
	}
	if v, ok := c.cache.Get(ck); ok {
		return v, nil
	}
	u, err := c.store.GetSimpleOwnerOfAddress(address, chain)
	if err != nil {
		if errors.Is(err, userstore.ErrorUserNotFound) {
			c.ignored.Set(ck, nil, cache.DefaultExpiration)
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	c.cacheUser(u)
	c.cache.Add(ck, u)
	return u, nil
}

func (c *LruCache) GetByUsername(username string) (*user.Simple, error) {
	ck := fmt.Sprintf("username:%s", username)
	if _, ok := c.ignored.Get(ck); ok {
		return nil, ErrorUserNotFound
	}
	if v, ok := c.cache.Get(ck); ok {
		return v, nil
	}
	u, err := c.store.GetSimpleByUsername(username)
	if err != nil {
		if errors.Is(err, userstore.ErrorUserNotFound) {
			c.ignored.Set(ck, nil, cache.DefaultExpiration)
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	c.cacheUser(u)
	return u, nil
}

func (c *LruCache) GetByID(id int64) (*user.Simple, error) {
	ck := fmt.Sprintf("id:%d", id)
	if _, ok := c.ignored.Get(ck); ok {
		return nil, ErrorUserNotFound
	}
	if v, ok := c.cache.Get(ck); ok {
		return v, nil
	}
	u, err := c.store.GetSimpleByID(id)
	if err != nil {
		if errors.Is(err, userstore.ErrorUserNotFound) {
			c.ignored.Set(ck, nil, cache.DefaultExpiration)
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	c.cacheUser(u)
	return u, nil
}

func (c *LruCache) cacheUser(simple *user.Simple) {
	c.cache.Add(fmt.Sprintf("id:%d", simple.ID), simple)
	c.cache.Add(fmt.Sprintf("username:%s", simple.Username), simple)
}
