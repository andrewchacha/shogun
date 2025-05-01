package accountstore

import (
	"database/sql"
	"errors"
	"shogun/internal/model/account"
	"shogun/internal/model/chain"
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

func (sas *SqlStore) checkBeforeCreate(acc *account.Account) error {
	if acc.Chain == "" {
		return errors.New("chain missing")
	}
	if acc.Address == "" {
		return errors.New("address missing")
	}
	if acc.UserID == 0 {
		return errors.New("user id missing")
	}
	acc.CreatedAt = time.Now()
	return nil
}

func (sas *SqlStore) CreateAccount(acc *account.Account) error {
	if err := sas.checkBeforeCreate(acc); err != nil {
		return err
	}
	res, err := sas.db.NamedQuery("INSERT INTO shogun.account(address,user_id,chain,signature,created_at) VALUES (:address,:user_id,:chain,:signature,:created_at) RETURNING id", acc)
	if err != nil {
		return err
	}
	if res.Next() {
		err = res.Scan(&acc.ID)
	}
	return err
}

func (sas *SqlStore) CreateAccountNoCommit(tx *sqlx.Tx, acc *account.Account) error {
	if err := sas.checkBeforeCreate(acc); err != nil {
		return err
	}
	res, err := tx.NamedQuery("INSERT INTO shogun.account(address,user_id,chain,signature,created_at) VALUES (:address,:user_id,:chain,:signature,:created_at) RETURNING id", acc)
	if err != nil {
		return err
	}
	if res.Next() {
		err = res.Scan(&acc.ID)
	}
	return err
}

func (sas *SqlStore) GetAccount(address string, chain chain.Chain) (*account.Account, error) {
	acc := account.New()
	err := sas.db.Get(acc, "SELECT * FROM shogun.account WHERE address = $1 AND chain = $2", address, chain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrorAccountNotFound
		}
		return nil, err
	}
	return acc, nil
}

func (sas *SqlStore) LinkAccounts(userID int64, accounts []account.Account) error {
	for i := range accounts {
		acc := &accounts[i]
		acc.UserID = userID
		acc.CreatedAt = time.Now()
	}
	//
	//TODO
	//tx, err := sas.writeDB.Beginx()
	//if err != nil {
	//	return err
	//}
	//for _, acc := range accounts {
	//
	//}

	return nil
}

func (sas *SqlStore) DoesAccountExist(address string, chain chain.Chain) (bool, error) {
	var count int
	err := sas.db.Get(&count, "SELECT COUNT(*) FROM shogun.account WHERE address = $1 AND chain = $2", address, chain)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (sas *SqlStore) GetUserIDForAddress(address string, chain chain.Chain) (int64, error) {
	var userID int64
	err := sas.db.Get(&userID, "SELECT user_id FROM shogun.account WHERE address = $1 AND chain = $2", address, chain)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, ErrorAccountNotFound
		}
		return 0, err
	}
	return userID, nil
}

func (sas *SqlStore) GetSimpleByUserID(userID int64) ([]account.Simple, error) {
	accounts := make([]account.Simple, 0)
	err := sas.db.Select(&accounts, "SELECT address,chain,signature FROM shogun.account WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	return accounts, nil
}
