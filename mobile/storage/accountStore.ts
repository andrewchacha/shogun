import {SqlDB, TableNames} from '@/storage/sqldb';
import {DB, Transaction} from '@op-engineering/op-sqlite';
import {AllChains, Chain} from '@/chains/chain';
import {getChainOperations} from '@/chains/chainOperations';
import {ChainKey} from '@/utils/types/wallet';
import crypto from 'react-native-quick-crypto';
import bs58 from 'bs58';
import {MMKV} from 'react-native-mmkv';
import {encryptedStorage} from '@/storage/mmkv';

export function getAccountStore(): AccountStore {
    return AccountStore.getInstance(SqlDB.getInstance().getDb(), encryptedStorage);
}

export const AccountStorageKeys = {
    currentAccountID: 'current-account-id',
} as const;

class AccountStore {
    private static instance: AccountStore;
    private db: DB;
    public readonly kvDB: MMKV;

    private constructor(db: DB, kvDB: MMKV) {
        this.db = db;
        this.kvDB = kvDB;
        this.createTables();
    }

    static getInstance(db: DB, kvDB: MMKV) {
        if (!AccountStore.instance) {
            AccountStore.instance = new AccountStore(db, kvDB);
        }
        return AccountStore.instance;
    }

    private createTables() {
        const walletTableQuery = `
            CREATE TABLE IF NOT EXISTS ${TableNames.Wallet} (
                id TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                mnemonic TEXT NOT NULL,
                created_at INTEGER NOT NULL
            );
        `;
        const accountTable = `
           CREATE TABLE IF NOT EXISTS ${TableNames.Account} (
                id TEXT PRIMARY KEY,
                wallet_id TEXT NOT NULL,
                path_index INTEGER NOT NULL,
                FOREIGN KEY (wallet_id) REFERENCES wallet(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );
        `;
        const accountIndex1 = `
            CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_path
            ON account (wallet_id, path_index);
        `;

        const secretsTable = `
            CREATE TABLE IF NOT EXISTS ${TableNames.Secret} (
                address TEXT PRIMARY KEY,
                secret_key TEXT NOT NULL,
                wallet_id TEXT NOT NULL,
                account_id TEXT NOT NULL,
                chain TEXT NOT NULL,
                FOREIGN KEY (wallet_id) REFERENCES wallet(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
                FOREIGN KEY (account_id) REFERENCES account(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );
        `;

        this.db.executeSync(walletTableQuery);
        this.db.executeSync(accountTable);
        this.db.executeSync(accountIndex1);
        this.db.executeSync(secretsTable);
    }

    public createNewWallet = async (mnemonic: string) => {
        const pathIndex = 0;
        const firstKeys: ChainKey[] = [];
        let mainKey: ChainKey | undefined;
        for (const chain of AllChains) {
            const op = getChainOperations(chain);
            const kp = await op.generateKeyFromMnemonic(mnemonic, pathIndex);
            firstKeys.push(kp);
            if (chain === Chain.Solana) {
                mainKey = kp;
            }
        }
        if (!mainKey) {
            throw new Error('main key not found');
        }

        const newWalletID = bs58.encode(crypto.createHash('sha256').update(mnemonic).digest('buffer'));
        const newWallet: DBWallet = {
            id: newWalletID,
            label: `Wallet ${this.getWalletCount() + 1}`,
            mnemonic,
            created_at: Date.now(),
        };
        const newAccount: DBAccount = {
            id: mainKey.address,
            wallet_id: newWallet.id,
            path_index: 0,
        };
        const newSecrets: DBSecret[] = firstKeys.map(kp => ({
            address: kp.address,
            secret_key: kp.secretKey,
            wallet_id: newWallet.id,
            account_id: newAccount.id,
            chain: kp.chain,
        }));

        return this.db.transaction(async (tx: Transaction) => {
            await tx.execute('INSERT INTO wallet (id, label, mnemonic, created_at) VALUES (?, ?, ?, ?)', [
                newWallet.id,
                newWallet.label,
                newWallet.mnemonic,
                newWallet.created_at,
            ]);
            await tx.execute('INSERT INTO account (id, wallet_id, path_index) VALUES (?, ?, ?)', [
                newAccount.id,
                newAccount.wallet_id,
                newAccount.path_index,
            ]);
            for (const secret of newSecrets) {
                await tx.execute(
                    'INSERT INTO secret (address, secret_key, wallet_id, account_id, chain) VALUES (?, ?, ?, ?, ?)',
                    [secret.address, secret.secret_key, secret.wallet_id, secret.account_id, secret.chain],
                );
            }
            await tx.commit();
            this.setCurrentAccountID(newAccount.id);
        });
    };

    public createNextAccountAtPathIndex = async (walletID: string, pathIndex: number) => {
        const mnemonic = this.getWalletMnemonic(walletID);
        if (!mnemonic) {
            throw new Error('mnemonic not found');
        }
        const newKeys: ChainKey[] = [];
        let solanaKey: ChainKey | undefined = undefined;
        for (const chain of AllChains) {
            const op = getChainOperations(chain);
            const kp = await op.generateKeyFromMnemonic(mnemonic, pathIndex);
            newKeys.push(kp);
            if (chain === Chain.Solana) {
                solanaKey = kp;
            }
        }
        if (!solanaKey || !solanaKey.address) {
            throw new Error('solana key not found');
        }
        const newAccount: DBAccount = {
            id: solanaKey.address,
            wallet_id: walletID,
            path_index: pathIndex,
        };
        return this.db.transaction(async (tx: Transaction) => {
            await tx.execute('INSERT INTO account (id, wallet_id, path_index) VALUES (?, ?, ?)', [
                newAccount.id,
                newAccount.wallet_id,
                newAccount.path_index,
            ]);
            for (const key of newKeys) {
                await tx.execute(
                    'INSERT INTO secret (address, secret_key, wallet_id, account_id, chain) VALUES (?, ?, ?, ?, ?)',
                    [key.address, key.secretKey, walletID, newAccount.id, key.chain],
                );
            }
            await tx.commit();
            this.setCurrentAccountID(newAccount.id);
        });
    };

    public getWalletCount = (): number => {
        let results = this.db.executeSync('SELECT COUNT(*) as count FROM wallet');
        if (!results) return 0;
        let rows = results.rows;
        if (!rows) return 0;
        return (rows[0].count as number) || 0;
    };

    public getAllWallets = (): DBWalletSimple[] => {
        let {rows} = this.db.executeSync('SELECT id, label FROM wallet');
        return rows as DBWalletSimple[];
    };

    public getCurrentWalletAllByAccountID = (accountID: string): DBWallet | undefined => {
        let {rows} = this.db.executeSync(
            'SELECT wallet.* FROM wallet JOIN account ON wallet.id = account.wallet_id WHERE account.id = ?',
            [accountID],
        );
        if (!rows) return undefined;
        return rows[0] as DBWallet;
    };

    public getWalletIDForAccountID(accountID: string): string | undefined {
        let {rows} = this.db.executeSync('SELECT wallet_id FROM account WHERE id = ?', [accountID]);
        if (!rows || rows.length == 0) return undefined;
        return rows[0].wallet_id as string;
    }

    public countAccountsForWallet = (walletID: string): number => {
        let {rows} = this.db.executeSync('SELECT COUNT(*) as count FROM account WHERE wallet_id = ?', [walletID]);
        if (!rows || rows.length == 0) return 0;
        return (rows[0].count as number) || 0;
    };

    public getWalletMnemonic = (walletID: string): string | undefined => {
        let {rows} = this.db.executeSync('SELECT mnemonic FROM wallet WHERE id = ?', [walletID]);
        if (!rows || rows.length == 0) return undefined;
        return rows[0].mnemonic as string;
    };

    public getNextPathIndex = (walletID: string): number => {
        let {rows} = this.db.executeSync('SELECT MAX(path_index) as max_index FROM account WHERE wallet_id = ?', [
            walletID,
        ]);
        if (!rows || rows.length == 0) return 0;
        return (rows[0].max_index as number) + 1 || 0;
    };

    public getChainKeyForAddress = (address: string): ChainKey | undefined => {
        let {rows} = this.db.executeSync('SELECT chain, secret_key FROM secret WHERE address = ?', [address]);
        if (!rows || rows.length === 0) {
            return undefined;
        }
        const row = rows[0] as {chain: Chain; secret_key: string};
        return {
            chain: row.chain,
            address: address,
            secretKey: row.secret_key,
        };
    };

    public getAccountByID = (accountID: string): DBAccount | undefined => {
        let {rows} = this.db.executeSync('SELECT * FROM account WHERE id = ?', [accountID]);
        if (!rows || rows.length == 0) return undefined;
        return rows[0] as DBAccount;
    };

    public getAddressForAccountIDChain = (accountID: string, chain: Chain): string | undefined => {
        let {rows} = this.db.executeSync('SELECT address FROM secret WHERE account_id = ? AND chain = ?', [
            accountID,
            chain,
        ]);
        if (!rows || rows.length == 0) return undefined;
        return rows[0].address as string;
    };

    public getMyAddressesForChain(chain: Chain): string[] {
        let {rows} = this.db.executeSync('SELECT address FROM secret WHERE chain = ?', [chain]);
        return rows.map((row: any) => row.address) || [];
    }

    public deleteEverything = () => {
        this.db.executeSync('DELETE FROM secret');
        this.db.executeSync('DELETE FROM account');
        this.db.executeSync('DELETE FROM wallet');
    };

    public currentAccountID(): string {
        return this.kvDB.getString(AccountStorageKeys.currentAccountID) || '';
    }

    public currentAccount(): DBAccount | undefined {
        const currentAccountID = this.currentAccountID();
        let {rows} = this.db.executeSync('SELECT * FROM account WHERE id = ?', [currentAccountID]);
        if (!rows || rows.length == 0) return undefined;
        return rows[0] as DBAccount;
    }

    public setCurrentAccountID(id: string) {
        this.kvDB.set(AccountStorageKeys.currentAccountID, id);
    }
}

export type DBWalletSimple = {
    id: string;
    label: string;
};

export type DBWallet = DBWalletSimple & {
    mnemonic: string;
    created_at: number;
};

export type DBAccount = {
    id: string;
    wallet_id: string;
    path_index: number;
};

export type DBSecretSimple = {
    address: string;
    chain: Chain;
};

export type DBSecret = DBSecretSimple & {
    secret_key: string;
    wallet_id: string;
    account_id: string;
};
