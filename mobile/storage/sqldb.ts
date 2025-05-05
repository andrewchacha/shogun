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
