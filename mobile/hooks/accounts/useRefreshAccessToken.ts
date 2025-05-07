import bs58 from 'bs58';
import {apiLogin, getApiLoginParamsWithSigner, getApiLoginSignMessage} from '@/utils/api/authLogin';
import {AccessToken} from '@/storage/token';
import {useEffect} from 'react';
import {Chain} from '@/chains/chain';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';
import {getAccountStore} from '@/storage/accountStore';
import {getChainOperations} from '@/chains/chainOperations';

//run every few min to refresh the access tokens
const timeBuffer = 10 * 60 * 1000;
export function useRefreshAccessToken() {
    const accountID = useCurrentAccountID();
    useEffect(() => {
        if (!accountID) return;
        void refreshTokenForAccount(accountID);
        const interval = setInterval(() => refreshTokenForAccount(accountID), timeBuffer);
        return () => clearInterval(interval);
    }, [accountID]);
}

async function refreshTokenForAccount(accountID: string) {
    try {
        const expireAt = AccessToken.getExpireAt(accountID);
        if (expireAt && expireAt - Date.now() > timeBuffer) {
            return;
        }
        console.debug('refreshing access-token', accountID);
        const secret = getAccountStore().getChainKeyForAddress(accountID);
        if (!secret) {
            return;
        }
        const ops = getChainOperations(Chain.Solana);
        if (!ops) {
            return;
        }
        const params = await getApiLoginParamsWithSigner(secret);
        const res = await apiLogin(params);
        if (res.data?.access_token) {
            AccessToken.store(accountID, res.data.access_token, res.data.expires_in);
            return;
        }
    } catch (error) {
        console.log(error);
    }
}
