package accountstore

import (
	"shogun/internal/model/account"
	"shogun/internal/model/chain"
	"shogun/internal/utils/testutil"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestSqlStore_CreateAccount(t *testing.T) {
	db := testutil.GetSqlDB()
	store := NewSqlStore(db)

	createdAt := time.Now()
	acc := &account.Account{
		Address:   "test-sui-key",
		UserID:    1,
		Chain:     chain.Sui,
		Signature: "test-sui-signature",
		CreatedAt: createdAt,
	}
	err := store.CreateAccount(acc)
	assert.NoError(t, err)
	assert.NotZero(t, acc.ID)

	// Verify the account was created
	createdAcc, err := store.GetAccount(acc.Address, acc.Chain)
	assert.NoError(t, err)
	assert.Equal(t, acc.Address, createdAcc.Address)
	assert.Equal(t, acc.Chain, createdAcc.Chain)
	assert.Equal(t, acc.UserID, createdAcc.UserID)
	assert.Equal(t, acc.Signature, createdAcc.Signature)
	assert.Equal(t, acc.CreatedAt.UnixNano(), createdAcc.CreatedAt.UnixNano())
}

func TestSqlStore_GetAccount(t *testing.T) {
	db := testutil.GetSqlDB()
	store := NewSqlStore(db)

	// First, create an account
	acc := &account.Account{
		Chain:   chain.Sui,
		Address: "testaddress",
		UserID:  1,
	}
	err := store.CreateAccount(acc)
	assert.NoError(t, err)

	// Now test getting the account
	retrievedAcc, err := store.GetAccount(acc.Address, acc.Chain)

	assert.NoError(t, err)
	assert.Equal(t, acc.ID, retrievedAcc.ID)
	assert.Equal(t, acc.Chain, retrievedAcc.Chain)
	assert.Equal(t, acc.Address, retrievedAcc.Address)
	assert.Equal(t, acc.UserID, retrievedAcc.UserID)
}

func TestSqlStore_DoesAccountExist(t *testing.T) {
	db := testutil.GetSqlDB()
	store := NewSqlStore(db)

	// First, create an account
	acc := &account.Account{
		Chain:   chain.Chain("testchain"),
		Address: "testaddress",
		UserID:  1,
	}
	err := store.CreateAccount(acc)
	assert.NoError(t, err)

	// Test for existing account
	exists, err := store.DoesAccountExist(acc.Address, acc.Chain)
	assert.NoError(t, err)
	assert.True(t, exists)

	// Test for non-existing account
	exists, err = store.DoesAccountExist("nonexistent", chain.Chain("nonexistent"))
	assert.NoError(t, err)
	assert.False(t, exists)
}

func TestSqlStore_GetUserIDForAddress(t *testing.T) {
	db := testutil.GetSqlDB()
	store := NewSqlStore(db)

	// First, create an account
	acc := &account.Account{
		Chain:   chain.Chain("testchain"),
		Address: "testaddress",
		UserID:  1,
	}
	err := store.CreateAccount(acc)
	assert.NoError(t, err)

	// Test getting user ID
	userID, err := store.GetUserIDForAddress(acc.Address, acc.Chain)
	assert.NoError(t, err)
	assert.Equal(t, acc.UserID, userID)

	// Test for non-existing account
	_, err = store.GetUserIDForAddress("nonexistent", chain.Chain("nonexistent"))
	assert.Error(t, err)
	assert.Equal(t, ErrorAccountNotFound, err)
}

func TestSqlStore_GetSimpleByUserID(t *testing.T) {
	db := testutil.GetSqlDB()
	store := NewSqlStore(db)

	// Create a few accounts for the same user
	userID := int64(1)
	accounts := []account.Account{
		{Chain: chain.Chain("chain1"), Address: "address1", UserID: userID},
		{Chain: chain.Chain("chain2"), Address: "address2", UserID: userID},
	}

	for _, acc := range accounts {
		err := store.CreateAccount(&acc)
		assert.NoError(t, err)
	}

	// Test getting simple accounts
	simpleAccounts, err := store.GetSimpleByUserID(userID)
	assert.NoError(t, err)
	assert.Len(t, simpleAccounts, 2)

	// Verify the returned accounts
	for i, simpleAcc := range simpleAccounts {
		assert.Equal(t, accounts[i].Address, simpleAcc.Address)
		assert.Equal(t, accounts[i].Chain, simpleAcc.Chain)
	}
}
