import {Chain} from '@/chains/chain';
import {apiGet} from '@/utils/api/api';
import {TokenInfo} from '@/utils/api/tokenInfo';
import {UserSimple} from '@/utils/api/userSearch';

export type WalletTransaction = {
    type: string;
    signature: string;
    from_address: string;
    to_address: string;
    timestamp: number;
    fee: {
        amount: string;
        symbol: string;
    };
    changes: WalletTransfer[];
    user?: UserSimple;
    failed: boolean;
};

export type WalletTransfer = {
    ui_amount: string;
} & TokenInfo;

export async function apiFetchWalletHistory(address: string, chain: Chain) {
    return apiGet<WalletTransaction[]>(`/wallet/history?address=${address}&chain=${chain}`);
}
