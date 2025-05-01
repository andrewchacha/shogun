package prefstore

import (
	"context"
	"encoding/json"
	"errors"
	"reflect"
	"shogun/internal/model/preferences"
	"strconv"
	"time"

	"github.com/nats-io/nats.go/jetstream"
	"github.com/rs/zerolog/log"
)

const natsPreferenceBucketName = "user-preferences"

type Nats struct {
	//we only need jetstream KV, so that's the only one we're using
	store jetstream.KeyValue
}

func NewNats(j jetstream.JetStream) *Nats {
	//make a context that times out after 10 seconds, if we fail error out
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	b, err := j.KeyValue(ctx, natsPreferenceBucketName)
	//this must work otherwise we can't continue
	if err != nil && !errors.Is(err, jetstream.ErrBucketNotFound) {
		log.Fatal().Err(err).Msg("failed to get preferences bucket")
	}
	//if the bucket doesn't exist, create it
	if errors.Is(err, jetstream.ErrBucketNotFound) {
		b, err = j.CreateKeyValue(ctx,
			jetstream.KeyValueConfig{
				Bucket:       natsPreferenceBucketName,
				Description:  "bucket for storing user preferences",
				History:      1,
				MaxValueSize: 1024 * 1024, //1MB
				Storage:      jetstream.FileStorage,
				Compression:  true,
			})
		if err != nil {
			log.Fatal().Err(err).Msg("failed to create preferences bucket")
		}
	}
	//return the service
	return &Nats{store: b}
}

func (jp *Nats) Create(userID int64, u *preferences.Preferences) error {
	id := strconv.FormatInt(userID, 10)
	jsonData, err := json.Marshal(u)
	if err != nil {
		//if we can't marshal the data, we can't continue, so we error out
		//this should never fail, so we log it as fatal
		log.Fatal().Err(err).Msg("failed to marshal preferences")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err = jp.store.Create(ctx, id, jsonData)
	if err != nil && errors.Is(err, jetstream.ErrKeyExists) {
		//this is a custom error, we need to define it
		//that way it's easier to compare from elsewhere to know what error it is
		return ErrorDuplicateUserID
	}
	return err
}

func (jp *Nats) Get(userID int64) (*preferences.Preferences, error) {
	pref, _, err := jp.getForUser(userID)
	return pref, err
}

func (jp *Nats) getForUser(userID int64) (*preferences.Preferences, uint64, error) {
	id := strconv.FormatInt(userID, 10)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	val, err := jp.store.Get(ctx, id)
	if err != nil {
		if errors.Is(err, jetstream.ErrKeyNotFound) {
			return nil, 0, ErrorKeyNotFound
		}
		return nil, 0, err
	}
	pref := &preferences.Preferences{}
	err = json.Unmarshal(val.Value(), pref)
	if err != nil {
		return nil, 0, err
	}
	return pref, val.Revision(), nil
}

func (jp *Nats) Update(userID int64, p *preferences.Preferences) error {
	id := strconv.FormatInt(userID, 10)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	curr, revision, err := jp.getForUser(userID)
	if err != nil {
		return err
	}
	merged := mergePreferences(curr, p)
	toStore, err := json.Marshal(merged)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to marshal preferences")
	}
	_, err = jp.store.Update(ctx, id, toStore, revision)
	return err
}

func mergePreferences(curr, next *preferences.Preferences) *preferences.Preferences {
	merged := *curr
	currVal := reflect.ValueOf(curr).Elem()
	pVal := reflect.ValueOf(next).Elem()
	mergedVal := reflect.ValueOf(&merged).Elem()

	for i := 0; i < currVal.NumField(); i++ {
		field := currVal.Type().Field(i)
		pFieldVal := pVal.Field(i)
		if !pFieldVal.IsNil() {
			mergedVal.FieldByName(field.Name).Set(pFieldVal)
		}
	}

	return &merged
}
