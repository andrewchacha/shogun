import {API_URL} from '@/constants/server';
import {getHeaders} from '@/utils/api/apiHeaders';
import {ApiRes, ApiStatus} from '@/utils/types/api';
import {ChainKey} from '@/utils/types/wallet';
import {getChainOperations} from '@/chains/chainOperations';
import {getAccountStore} from '@/storage/accountStore';
import {AccessToken} from '@/storage/token';

export function getApiLoginSignMessage(solanaAddress: string, timestamp: string): string {
    return `/auth/login/${solanaAddress}?timestamp=${timestamp}`;
}

export type LoginResponse = {
    access_token: string;
    is_new_user: boolean;
    expires_in: number;
};

export type LoginParams = {
    solanaAddress: string;
    timestamp: string;
    signature: string;
};

export async function getApiLoginParamsWithSigner(signer: ChainKey): Promise<LoginParams> {
    const timestamp = `${Date.now()}`;
    const message = getApiLoginSignMessage(signer.address, timestamp);
    const ops = getChainOperations(signer.chain);
    const signature = await ops.signShogunMessage(signer, message);
    return {solanaAddress: signer.address, timestamp, signature};
}

export async function apiLogin(params: LoginParams): Promise<ApiRes<LoginResponse>> {
    const endpoint = `${API_URL}/auth/login?public_key=${params.solanaAddress}&timestamp=${params.timestamp}&signature=${params.signature}`;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
    });
    const res = await response.json();
    if (res.status === ApiStatus.Success) {
        return {data: res.data, status: res.status};
    }
    if (!res.ok) {
        throw res;
    }
    throw res;
}

export async function tryLoginCurrentUser() {
    const store = getAccountStore();
    const currentAccount = store.currentAccountID();
    if (!currentAccount) {
        return;
    }
    const solanaKey = store.getChainKeyForAddress(currentAccount);
    if (!solanaKey) {
        return;
    }
    const params = await getApiLoginParamsWithSigner(solanaKey);
    const res = await apiLogin(params);
    if (res.data?.access_token) {
        AccessToken.store(solanaKey.address, res.data.access_token, res.data.expires_in);
    }
}
