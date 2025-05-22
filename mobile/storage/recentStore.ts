import {DB} from '@op-engineering/op-sqlite';
import {SqlDB, TableNames} from '@/storage/sqldb';
import {Chain} from '@/chains/chain';

export const getRecentStore = () => {
    return RecentStore.getInstance(SqlDB.getInstance().getDb());
};

class RecentStore {
    private static instance: RecentStore;
    private db: DB;

    private constructor(db: DB) {
        this.db = db;
        this.createTables();
    }

    static getInstance(db: DB) {
        if (!RecentStore.instance) {
            RecentStore.instance = new RecentStore(db);
        }
        return RecentStore.instance;
    }

    private createTables() {
        const createQuery = `
            CREATE TABLE IF NOT EXISTS ${TableNames.Recent} (
                address TEXT PRIMARY KEY,
                chain TEXT NOT NULL,
                from_address TEXT,
                date INTEGER NOT NULL
            );
        `;
        const indexChainDate = `CREATE INDEX IF NOT EXISTS chain_date ON ${TableNames.Recent} (chain, date);`;
        const indexFromAddressDate = `CREATE INDEX IF NOT EXISTS from_address_date ON ${TableNames.Recent} (from_address, date);`;

        this.db.executeSync(createQuery);
        this.db.executeSync(indexChainDate);
        this.db.executeSync(indexFromAddressDate);
    }

    public addRecent(recent: DBRecent) {
        this.db.executeSync(
            `INSERT OR REPLACE INTO ${TableNames.Recent} (address, chain, from_address, date) VALUES (?, ?, ?, ?)`,
            [recent.address, recent.chain, recent.from_address, recent.date],
        );
    }

    public getRecentForChain(chain: string): DBRecent[] {
        try {
            const {rows} = this.db.executeSync(
                `SELECT * FROM ${TableNames.Recent} WHERE chain = ? ORDER BY date DESC LIMIT 10`,
                [chain],
            );
            return rows as DBRecent[];
        } catch (e) {
            console.log('Error getting recent for chain', e);
            return [];
        }
    }
}

type DBRecent = {
    address: string;
    chain: Chain;
    date: number;
    from_address: string;
};
