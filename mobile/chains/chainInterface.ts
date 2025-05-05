import {ChainKey} from '@/utils/types/wallet';
import {TokenInfo} from '@/utils/api/tokenInfo';

//ChainInterface - every chain supported by the wallet must implement this interface
export interface ChainInterface {
    verifyAddress(address: string): boolean;
    transfer(
        from: ChainKey,
        toPublicAddress: string,
        toUiAmount: string,
        token: TokenInfo,
        fee?: FeeEstimate,
    ): Promise<string>;
    confirmTransaction(signature: string): Promise<boolean>;
    generateKeyFromMnemonic(mnemonic: string, index: number): Promise<ChainKey>;
    signShogunMessage(key: ChainKey, message: string): Promise<string>;
    getExplorerUrlForTx(tx: string): string;
    getFeeEstimate(fromAddress: string, toAddress: string, toUiAmount: string, token: TokenInfo): Promise<FeeEstimate>;
    logoUri(): string;
    name(): string;
    symbol(): string;
    openTxOnBrowser(signature: string): void;
}

export type FeeEstimate = {
    fee: string;
    symbol: string;
};
