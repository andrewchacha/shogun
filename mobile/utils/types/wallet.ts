import {Chain} from '@/chains/chain';

export type AccountStore = {
    id: string;
    mnemonic: string;
    accounts: Account[];
};

export type Account = {
    index: number;
    id: string;
    hidden: boolean;
    keys: ChainKey[];
};

export type ChainKey = {
    chain: Chain;
    address: string;
    secretKey: string;
};
