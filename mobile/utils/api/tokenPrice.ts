import {apiGet} from '@/utils/api/api';

export type TokenPrice = {
    price: string;
};

export function apiFetchTokenPrice(address: string) {
    return apiGet<TokenPrice>(`/token/price/${address}`);
}
