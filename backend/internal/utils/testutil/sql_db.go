package testutil

import "github.com/jmoiron/sqlx"

var db *sqlx.DB

func InitSqlDB() error {
	return nil
}

func GetSqlDB() *sqlx.DB {
	return db
}
