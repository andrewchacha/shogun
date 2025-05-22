import {useEffect, useState} from 'react';
import {SqlDB, TableNames} from '@/storage/sqldb';
import {AccountStorageKeys, DBAccount, DBSecretSimple, getAccountStore} from '@/storage/accountStore';
import {useMMKVString} from 'react-native-mmkv';

export function useCurrentAccountID() {
    const [id] = useMMKVString(AccountStorageKeys.currentAccountID, getAccountStore().kvDB);
    return id;
}

export function useCurrentKeys() {
    const currentAccountID = useCurrentAccountID();
    const {result} = useSqlQueryArray<DBSecretSimple[]>(
        `SELECT address, chain FROM ${TableNames.Secret} WHERE account_id = ?`,
        TableNames.Secret,
        [currentAccountID],
        currentAccountID,
    );
    return {result};
}

export function useAccounts(walletID: string) {
    const {result} = useSqlQueryArray<DBAccount[]>(
        `SELECT * FROM ${TableNames.Account} WHERE wallet_id = $1`,
        TableNames.Account,
        [walletID],
        walletID,
    );
    return {result};
}

export function useSqlQueryArray<T>(query: string, table: string, args: any[] = [], refreshKey?: string) {
    const [result, setResult] = useState<T | undefined>(undefined);

    useEffect(() => {
        if (!query) return;
        const db = SqlDB.getInstance().getDb();
        const {rows} = db.executeSync(query, args);
        setResult(rows as T);
        const unsubscribe = db.reactiveExecute({
            query,
            arguments: args,
            fireOn: [{table: table}],
            callback: () => {
                executeAndSetResult(query, args);
            },
        });
        return () => {
            unsubscribe();
        };
    }, [query, table, refreshKey]);

    const executeAndSetResult = (query: string, args: any[] = []) => {
        const db = SqlDB.getInstance().getDb();
        const {rows} = db.executeSync(query, args);
        setResult(rows as T);
    };

    return {result};
}
