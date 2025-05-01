package prefstore

import (
	"database/sql"
	"errors"
	"fmt"
	"shogun/internal/data"
	"shogun/internal/model/preferences"
	"time"

	"github.com/jmoiron/sqlx"
)

type PreferencesItem struct {
	UserID    int64                   `db:"user_id" json:"user_id"`
	Meta      preferences.Preferences `db:"meta" json:"meta"`
	CreatedAt time.Time               `db:"created_at" json:"created_at"`
	UpdatedAt time.Time               `db:"updated_at" json:"updated_at"`
}

type SqlStore struct {
	db *sqlx.DB
}

func NewSqlStore(db *sqlx.DB) *SqlStore {
	return &SqlStore{
		db: db,
	}
}

func (s *SqlStore) Create(userID int64, p *preferences.Preferences) error {
	if userID == 0 {
		return fmt.Errorf("user_id is required")
	}
	item := &PreferencesItem{
		UserID: userID,
		Meta:   *p,
	}
	_, err := s.db.NamedExec("INSERT INTO shogun.preferences (user_id,meta) VALUES(:user_id,:meta)", item)
	if err != nil && data.IsUniqueViolation(err) {
		return ErrorDuplicateUserID
	}
	return err
}

func (s *SqlStore) Get(userID int64) (*preferences.Preferences, error) {
	p := &preferences.Preferences{}
	err := s.db.Get(p, "SELECT meta FROM shogun.preferences WHERE user_id=$1", userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorNotFound
		}
		return nil, err
	}
	return p, nil
}

func (s *SqlStore) Update(userID int64, p *preferences.Preferences) error {
	_, err := s.db.Exec("UPDATE shogun.preferences SET meta = meta || $1 WHERE user_id = $2", p, userID)
	return err
}
