import {Chain} from '@/chains/chain';
import {ChainKey} from '@/utils/types/wallet';
import {TokenInfo} from '@/utils/api/tokenInfo';
import {ChainInterface, FeeEstimate} from '@/chains/chainInterface';
import {mnemonicToSeed} from '@dreson4/react-native-quick-bip39';
import {derivePath} from 'ed25519-hd-key';
import {decodeSuiPrivateKey} from '@/chains/sui/suiKey';
import bs58 from 'bs58';
import {Buffer} from '@craftzdog/react-native-buffer';
import BigNumber from 'bignumber.js';
import {getFullnodeUrl, SuiClient} from '@mysten/sui/client';
import {isValidSuiAddress} from '@mysten/sui/utils';
import {Ed25519Keypair} from '@mysten/sui/keypairs/ed25519';
import {SUI_COIN_ADDRESS} from '@/constants/values';
import {Transaction} from '@mysten/sui/transactions';
import * as WebBrowser from 'expo-web-browser';
import {invalidateWalletHistory} from '@/hooks/wallets/useWalletHistory';

export const suiClient = new SuiClient({url: getFullnodeUrl('mainnet')});

export class SuiChain implements ChainInterface {
    private static instance: SuiChain;
    private constructor() {}
    static getInstance() {
        if (!SuiChain.instance) {
            SuiChain.instance = new SuiChain();
        }
        return SuiChain.instance;
    }

    public verifyAddress(address: string): boolean {
        return isValidSuiAddress(address);
    }

    async transfer(
        from: ChainKey,
        toPublicAddress: string,
        toUiAmount: string,
        token: TokenInfo,
        fee?: FeeEstimate,
    ): Promise<string> {
        if (!token) throw 'Token not found';
        const fromKeyPair = this.getSuiKeyFromChainKey(from);
        const rawAmount = new BigNumber(toUiAmount).shiftedBy(token.decimals).integerValue(0).toString();
        if (!isValidSuiAddress(toPublicAddress)) {
            throw 'Invalid address';
        }

        const senderAddress = fromKeyPair.getPublicKey().toSuiAddress();
        const tokenBalance = await suiClient.getBalance({
            owner: senderAddress,
            coinType: token.address,
        });
        if (!tokenBalance) throw 'No tokens found';
        const totalTokenBalance = new BigNumber(tokenBalance.totalBalance);
        if (totalTokenBalance.lt(rawAmount)) {
            throw 'Insufficient token balance';
        }

        // Always get SUI balance for fee
        const suiBalance = await suiClient.getBalance({
            owner: senderAddress,
            coinType: SUI_COIN_ADDRESS,
        });
        if (!suiBalance) throw 'No SUI found for fee';
        let sendAmount = new BigNumber(rawAmount);
        let sendFee = new BigNumber(fee?.fee || 0).shiftedBy(9);
        if (!sendFee) {
            const feeEstimate = await this.getFeeEstimate(senderAddress, toPublicAddress, toUiAmount, token);
            sendFee = new BigNumber(feeEstimate.fee).shiftedBy(9);
        }
        if (new BigNumber(suiBalance.totalBalance).lt(sendFee)) {
            throw 'Insufficient SUI balance for fee';
        }

        const tx = new Transaction();
        if (token.address === SUI_COIN_ADDRESS) {
            if (sendAmount.eq(totalTokenBalance)) {
                sendAmount = sendAmount.minus(sendFee);
            } else if (sendAmount.plus(sendFee).gt(totalTokenBalance)) {
                throw 'Insufficient SUI balance for transfer and fee';
            }
            const [coin] = tx.splitCoins(tx.gas, [sendAmount.toString()]);
            tx.transferObjects([coin], toPublicAddress);
        } else {
            // For other tokens, we need to select the appropriate coins
            const {data: coins} = await suiClient.getCoins({
                owner: senderAddress,
                coinType: token.address,
            });

            let selectedCoins = [];
            let selectedAmount = new BigNumber(0);

            for (const coin of coins) {
                selectedCoins.push(coin.coinObjectId);
                selectedAmount = selectedAmount.plus(coin.balance);
                if (selectedAmount.gte(sendAmount)) break;
            }
            if (selectedAmount.lt(sendAmount)) {
                throw 'Insufficient balance';
            }
            const [primaryCoin, ...mergeCoins] = selectedCoins;
            if (mergeCoins.length > 0) {
                tx.mergeCoins(primaryCoin, mergeCoins);
            }
            const [sendCoin] = tx.splitCoins(primaryCoin, [sendAmount.toString()]);
            tx.transferObjects([sendCoin], toPublicAddress);
        }
        console.log('trying to send', sendAmount.toString(), 'to', toPublicAddress, 'with fee', sendFee.toString());
        console.log(
            'sender address',
            senderAddress,
            'token address',
            token.address,
            'token balance',
            totalTokenBalance.toString(),
        );

        tx.setGasBudget(sendFee.toNumber());
        tx.setSender(senderAddress);
        const res = await suiClient.signAndExecuteTransaction({signer: fromKeyPair, transaction: tx});
        return res.digest;
    }

    async generateKeyFromMnemonic(mnemonic: string, index: number): Promise<ChainKey> {
        const path = `m/44'/784'/${index}'/0'/0'`;
        const seed = mnemonicToSeed(mnemonic).toString('hex');
        const derivedSeed = derivePath(path, seed).key;
        const suiKeyPair = Ed25519Keypair.fromSecretKey(derivedSeed);
        return this.getChainKeyFromSuiKey(suiKeyPair);
    }

    async signShogunMessage(chainKey: ChainKey, message: string): Promise<string> {
        const signer = this.getSuiKeyFromChainKey(chainKey);
        const signature = bs58.encode(await signer.sign(Buffer.from(message)));
        const publicKey = bs58.encode(signer.getPublicKey().toRawBytes());
        //return merged public-key:signature coz we usually have only sui address which isn't enough
        return `${publicKey}:${signature}`;
    }

    private getSuiKeyFromChainKey(chainKey: ChainKey): Ed25519Keypair {
        const parsedKey = decodeSuiPrivateKey(chainKey.secretKey);
        return Ed25519Keypair.fromSecretKey(parsedKey.secretKey);
    }

    private getChainKeyFromSuiKey(keyPair: Ed25519Keypair): ChainKey {
        return {
            chain: Chain.Sui,
            address: keyPair.getPublicKey().toSuiAddress(),
            secretKey: keyPair.getSecretKey(),
        };
    }

    logoUri(): string {
        return 'https://images.shogun.social/coin_sui_sui_3kecc';
    }

    name(): string {
        return 'Sui';
    }

    symbol(): string {
        return 'SUI';
    }

    public async confirmTransaction(signature: string): Promise<boolean> {
        for (let i = 0; i < 5; i++) {
            const res = await suiClient.getTransactionBlock({
                digest: signature,
            });
            if (res.timestampMs) return true;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        return false;
    }

    getExplorerUrlForTx(tx: string): string {
        return `https://suiscan.xyz/mainnet/tx/${tx}`;
    }

    public async getFeeEstimate(
        fromAddress: string,
        toAddress: string,
        toUiAmount: string,
        token: TokenInfo,
    ): Promise<FeeEstimate> {
        if (!token) throw 'Token not found';
        const rawAmount = new BigNumber(toUiAmount).shiftedBy(token.decimals).integerValue(0).toString();
        if (token.address === SUI_COIN_ADDRESS) {
            const tx = new Transaction();
            const [coin] = tx.splitCoins(tx.gas, [rawAmount]);
            tx.transferObjects([coin], toAddress);
            tx.setSender(fromAddress);
            const block = await tx.build({
                client: suiClient,
            });
            const dryRes = await suiClient.dryRunTransactionBlock({
                transactionBlock: block,
            });
            const budget = new BigNumber(dryRes.input.gasData.budget).shiftedBy(-9).toString();
            return {fee: budget, symbol: 'SUI'};
        }

        const {data: coins} = await suiClient.getCoins({
            owner: fromAddress,
            coinType: token.address,
        });

        let selectedCoins = [];
        let selectedAmount = new BigNumber(0);
        for (const coin of coins) {
            selectedCoins.push(coin.coinObjectId);
            selectedAmount = selectedAmount.plus(coin.balance);
            if (selectedAmount.gte(rawAmount)) break;
        }
        const tx = new Transaction();
        const [primaryCoin, ...mergeCoins] = selectedCoins;
        if (mergeCoins.length > 0) {
            tx.mergeCoins(primaryCoin, mergeCoins);
        }
        const [sendCoin] = tx.splitCoins(primaryCoin, [rawAmount.toString()]);
        tx.transferObjects([sendCoin], toAddress);
        tx.setSender(fromAddress);
        const block = await tx.build({
            client: suiClient,
        });
        const dryRes = await suiClient.dryRunTransactionBlock({
            transactionBlock: block,
        });

        const budget = new BigNumber(dryRes.input.gasData.budget).shiftedBy(-9).toString();
        return {fee: budget, symbol: 'SUI'};
    }

    public openTxOnBrowser(signature: string): void {
        void WebBrowser.openBrowserAsync(this.getExplorerUrlForTx(signature));
    }
}
