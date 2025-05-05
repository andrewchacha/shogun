import {apiGet} from '@/utils/api/api';
import {Chain} from '@/chains/chain';

export type WalletAsset = {
    name: string;
    symbol: string;
    address: string;
    logo: string;
    price: string;
    ui_amount: string;
    raw_amount: string;
    decimals: number;
    total: string;
    chain: Chain;
};

type WalletAssetResponse = {
    native: WalletAsset;
    tokens: WalletAsset[];
    usd_value: string;
};

export async function apiFetchWalletAssets(address: string, chain: Chain) {
    return apiGet<WalletAssetResponse>(`/wallet/assets?address=${address}&chain=${chain}`);
}
