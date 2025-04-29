package data

import (
	"database/sql"
	"errors"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
)

var db *sqlx.DB

func Init(url string) *sqlx.DB {
	db = connectToPostgres(url)
	log.Info().Msg("postgresql database connected")
	checkSSLConnection(db)
	return db
}

func connectToPostgres(url string) *sqlx.DB {
	log.Info().Msg("connecting to postgresql database")
	db, err := sqlx.Connect("pgx", url)
	if err != nil {
		log.Fatal().Err(err).Msg("postgresql connection failed")
	}
	err = db.Ping()
	if err != nil {
		log.Fatal().Err(err).Msg("postgresql connection failed")
	}
	return db
}

func checkSSLConnection(db *sqlx.DB) {
	var sslInUse bool
	var version sql.NullString

	err := db.QueryRow("SELECT ssl, version FROM pg_stat_ssl WHERE pid = pg_backend_pid()").Scan(&sslInUse, &version)
	if err != nil {
		log.Error().Err(err).Msg("Failed to query SSL status")
		return
	}

	if sslInUse {
		if version.Valid {
			log.Info().Str("SSL Version", version.String).Msg("SSL is being used")
		} else {
			log.Info().Msg("SSL is being used, but version information is not available")
		}
	} else {
		log.Info().Msg("SSL is not being used")
	}
}

func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == pgerrcode.UniqueViolation
	}
	return false
}
