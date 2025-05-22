import {DB, open} from '@op-engineering/op-sqlite';

export const dbName = 'shogun.db';

export class SqlDB {
    private static instance: SqlDB;
    private constructor() {}

    static getInstance() {
        if (!SqlDB.instance) {
            SqlDB.instance = new SqlDB();
        }
        return SqlDB.instance;
    }

    private db: DB | null = null;
    public getDb(): DB {
        if (!this.db) {
            throw new Error('DB not initialized');
        }
        return this.db;
    }

    public hasAccounts() {
        if (!this.db) {
            throw new Error('DB not initialized');
        }
        const {rows} = this.getDb().executeSync('SELECT COUNT(*) as count FROM wallet');
        if (!rows) return false;
        const count = rows[0].count as number;
        return count > 0;
    }

    public init = (encryptionKey: string) => {
        this.db = open({name: dbName, encryptionKey});
    };
}

export const TableNames = {
    Wallet: 'wallet',
    Account: 'account',
    Secret: 'secret',
    Recent: 'recent',
    AddressBook: 'address_book',
};
