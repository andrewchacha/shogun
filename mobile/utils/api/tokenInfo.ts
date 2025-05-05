import {apiGet} from '@/utils/api/api';
import {Chain} from '@/chains/chain';

export type TokenInfo = {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logo: string;
    meta?: {
        sui_object_id?: string;
    };
    chain: string;
};

export function apiFetchTokenInfo(address: string, chain?: Chain) {
    return apiGet<TokenInfo>(`/token/info/${address}?chain=${chain}`);
}
