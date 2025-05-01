package userstore

import (
	"database/sql"
	"errors"
	"fmt"
	"reflect"
	"shogun/internal/data"
	"shogun/internal/model/chain"
	"shogun/internal/model/image"
	"shogun/internal/model/user"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type SqlStore struct {
	db *sqlx.DB
}

func NewSqlStore(db *sqlx.DB) *SqlStore {
	return &SqlStore{
		db: db,
	}
}

func (sus *SqlStore) CreateUserNoCommit(tx *sqlx.Tx, u *user.User) error {
	if u.ID != 0 {
		return errors.New("trying to create user with non-zero ID")
	}
	if u.CreatedAt.IsZero() {
		u.CreatedAt = time.Now()
		u.UpdatedAt = u.CreatedAt
	}
	rows, err := tx.NamedQuery("INSERT INTO shogun.user (username, thumbnail, meta, created_at, updated_at) VALUES (:username, :thumbnail, :meta, :created_at, :updated_at) RETURNING id", u)
	if err != nil {
		return err
	}
	var insertedID int64
	for rows.Next() {
		err = rows.Scan(&insertedID)
		if err != nil {
			return err
		}
	}
	u.ID = insertedID
	return nil
}

func (sus *SqlStore) GetOne(id int64) (*user.User, error) {
	u := user.New()
	err := sus.db.Get(u, "SELECT * FROM shogun.user WHERE id = $1", id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (sus *SqlStore) GetMeta(id int64) (*user.Meta, error) {
	meta := &user.Meta{}
	err := sus.db.Get(meta, "SELECT meta FROM shogun.user WHERE id = $1", id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	return meta, nil
}

func (sus *SqlStore) Update(id int64, updatable *user.Updatable) error {
	val := reflect.ValueOf(updatable).Elem()
	typeOfT := val.Type()

	fields := make([]string, 0)
	values := make(map[string]interface{})

	//scanning non-nil fields and creating the query to update them
	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		if !field.IsNil() {
			tag := typeOfT.Field(i).Tag.Get("db")
			fields = append(fields, fmt.Sprintf("%s = :%s", tag, tag))
			values[tag] = field.Elem().Interface()
		}
	}

	if len(fields) == 0 {
		return nil
	}

	updateMeta := &user.Meta{}
	shouldUpdateMeta := false
	if updatable.Username != nil {
		updateMeta.LastUsernameUpdate = time.Now().UnixMilli()
		shouldUpdateMeta = true
	}
	if updatable.Name != nil {
		updateMeta.LastNameUpdate = time.Now().UnixMilli()
		shouldUpdateMeta = true
	}
	if shouldUpdateMeta {
		fields = append(fields, "meta = meta || :meta")
		values["meta"] = updateMeta
	}

	values["id"] = id
	query := fmt.Sprintf("UPDATE shogun.user SET %s WHERE id = :id", strings.Join(fields, ", "))
	_, err := sus.db.NamedExec(query, values)
	if err != nil {
		if data.IsUniqueViolation(err) {
			return ErrorDuplicateUsername
		}
		return err
	}
	return err
}

func (sus *SqlStore) UpdateThumbnail(id int64, location *image.Image) error {
	_, err := sus.db.Exec("UPDATE shogun.user SET thumbnail = $1 WHERE id = $2", location, id)
	return err
}

func (sus *SqlStore) GetSimpleOwnerOfAddress(address string, chain chain.Chain) (*user.Simple, error) {
	u := &user.Simple{}
	err := sus.db.Get(u, "SELECT u.id, u.username, u.thumbnail, u.Name FROM shogun.user AS u JOIN shogun.account AS a ON u.id = a.user_id WHERE a.address = $1 AND a.chain = $2", address, chain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (sus *SqlStore) GetSimpleOwnersOfAddresses(addresses []string, chain chain.Chain) ([]user.SimpleByAddress, error) {
	res := make([]user.SimpleByAddress, 0, len(addresses))
	err := sus.db.Select(&res, "SELECT u.id, u.username, u.thumbnail, u.name, a.address FROM shogun.user AS u JOIN shogun.account AS a ON u.id = a.user_id WHERE a.address = ANY($1) AND a.chain = $2", addresses, chain)
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (sus *SqlStore) GetSimpleByID(id int64) (*user.Simple, error) {
	u := &user.Simple{}
	err := sus.db.Get(u, "SELECT id, username, thumbnail, name FROM shogun.user WHERE id = $1", id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (sus *SqlStore) GetSimpleByUsername(username string) (*user.Simple, error) {
	u := &user.Simple{}
	err := sus.db.Get(u, "SELECT id, username, thumbnail, name FROM shogun.user WHERE username = $1", username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorUserNotFound
		}
		return nil, err
	}
	return u, nil
}

func (sus *SqlStore) GetUsernames(limit int) ([]string, error) {
	usernames := make([]string, 0)
	offset := 0
	for {
		var u []string
		query := "SELECT username FROM shogun.user LIMIT $1 OFFSET $2"
		err := sus.db.Select(&u, query, limit, offset)
		if err != nil {
			return nil, err
		}

		if len(u) == 0 {
			break
		}
		usernames = append(usernames, u...)
		offset += limit
	}
	return usernames, nil
}

func (sus *SqlStore) GetAllUsernames(callback func(username string)) error {
	limit := 5000
	lastID := int64(0)
	for {
		var us []user.Clean
		query := "SELECT id, username FROM shogun.user WHERE id > $1 ORDER BY id LIMIT $2"
		err := sus.db.Select(&us, query, lastID, limit)
		if err != nil {
			return err
		}
		if len(us) == 0 {
			break
		}
		lastID = us[len(us)-1].ID
		for _, u := range us {
			callback(u.Username)
		}
	}
	return nil
}
