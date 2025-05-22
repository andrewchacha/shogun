import {Chain} from '@/chains/chain';
import {ChainKey} from '@/utils/types/wallet';
import {TokenInfo} from '@/utils/api/tokenInfo';
import {
    ComputeBudgetProgram,
    Connection,
    Keypair as SolanaKeyPair,
    Keypair,
    PublicKey,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import {mnemonicToSeed} from '@/utils/bip39/bip39';
import {derivePath} from 'ed25519-hd-key';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
import {ChainInterface, FeeEstimate} from '@/chains/chainInterface';
import {Buffer} from '@craftzdog/react-native-buffer';
import {
    createTransferCheckedInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
} from '@solana/spl-token';
import BigNumber from 'bignumber.js';
import * as WebBrowser from 'expo-web-browser';

//TODO temporary for testing, replace with actual connection
export const connection = new Connection(
    'https://mainnet.helius-rpc.com/?api-key=4f776923-6661-4358-a584-b1365e2aa7d9',
);

export class SolanaChain implements ChainInterface {
    private static instance: SolanaChain;

    private constructor() {}

    static getInstance() {
        if (!SolanaChain.instance) {
            SolanaChain.instance = new SolanaChain();
        }
        return SolanaChain.instance;
    }

    public verifyAddress(address: string): boolean {
        try {
            new PublicKey(address);
            return true;
        } catch (e) {
            return false;
        }
    }

    async transfer(
        from: ChainKey,
        toPublicAddress: string,
        toUiAmount: string,
        token: TokenInfo,
        fee?: FeeEstimate,
    ): Promise<string> {
        if (!token) {
            throw 'Token not found';
        }
        const tokenAddress = new PublicKey(token.address);
        const toAddress = new PublicKey(toPublicAddress);
        const senderKey = this.getSolanaKeyFromChainKey(from);

        const instructions = [];
        //TO GET FEE OF 50,000 LAMPORTS
        instructions.push(ComputeBudgetProgram.setComputeUnitLimit({units: 1_000_000}));
        instructions.push(ComputeBudgetProgram.setComputeUnitPrice({microLamports: 50_000}));

        if (tokenAddress.equals(SystemProgram.programId)) {
            const feeLamports = 5_000 + 50_000;
            const myLamports = await connection.getBalance(senderKey.publicKey);
            let sendLamports = new BigNumber(toUiAmount).shiftedBy(9).integerValue(0);
            if (sendLamports.eq(myLamports)) {
                sendLamports = sendLamports.minus(feeLamports);
            } else if (sendLamports.plus(feeLamports).gt(myLamports)) {
                throw 'Not enough balance';
            }
            const transferInstruction = SystemProgram.transfer({
                fromPubkey: senderKey.publicKey,
                toPubkey: toAddress,
                lamports: sendLamports.toNumber(),
            });
            instructions.push(transferInstruction);
        } else {
            const fromTokenAccount = await getAssociatedTokenAddress(tokenAddress, senderKey.publicKey);
            const receiverTokenAccount = await getAssociatedTokenAddress(tokenAddress, toAddress);
            const receiverAccount = await connection.getAccountInfo(receiverTokenAccount);
            if (!receiverAccount) {
                const inst = createAssociatedTokenAccountInstruction(
                    senderKey.publicKey,
                    receiverTokenAccount,
                    toAddress,
                    tokenAddress,
                );
                instructions.push(inst);
            }
            const transferInstruction = createTransferCheckedInstruction(
                fromTokenAccount,
                tokenAddress,
                receiverTokenAccount,
                senderKey.publicKey,
                new BigNumber(toUiAmount).shiftedBy(token.decimals).integerValue(0).toNumber(),
                token.decimals,
            );
            instructions.push(transferInstruction);
        }

        const latestBlockHash = await connection.getLatestBlockhash();
        const messageV0 = new TransactionMessage({
            payerKey: senderKey.publicKey,
            recentBlockhash: latestBlockHash.blockhash,
            instructions: instructions,
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0);
        transaction.sign([senderKey]);
        return await connection.sendTransaction(transaction);
    }

    async generateKeyFromMnemonic(mnemonic: string, index: number): Promise<ChainKey> {
        const seed = mnemonicToSeed(mnemonic).toString('hex');
        const path = `m/44'/501'/${index}'/0'`;
        const derivedSeed = derivePath(path, seed).key;
        const solanaKp = SolanaKeyPair.fromSeed(derivedSeed);
        return this.getChainKeyFromSolanaKey(solanaKp);
    }

    async signShogunMessage(key: ChainKey, message: string): Promise<string> {
        const solanaKey = this.getSolanaKeyFromChainKey(key);
        const messageBuffer = Buffer.from(message, 'utf-8');
        return bs58.encode(nacl.sign.detached(messageBuffer, solanaKey.secretKey));
    }

    private getSolanaKeyFromChainKey(chainKey: ChainKey): Keypair {
        return SolanaKeyPair.fromSecretKey(bs58.decode(chainKey.secretKey));
    }

    private getChainKeyFromSolanaKey(solanaKey: Keypair): ChainKey {
        return {
            chain: Chain.Solana,
            address: solanaKey.publicKey.toBase58(),
            secretKey: bs58.encode(solanaKey.secretKey),
        };
    }

    public logoUri(): string {
        return 'https://images.shogun.social/coin_sol_solana_3torr';
    }

    public name(): string {
        return 'Solana';
    }

    public symbol(): string {
        return 'SOL';
    }

    public async confirmTransaction(signature: string): Promise<boolean> {
        const latestBlockHash = await connection.getLatestBlockhash();

        const res = await connection.confirmTransaction(
            {
                blockhash: latestBlockHash.blockhash,
                lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
                signature: signature,
            },
            'confirmed',
        );

        return res && res.context && res.context.slot > 0;
    }

    public getExplorerUrlForTx(tx: string): string {
        return `https://solscan.io/tx/${tx}`;
    }

    public getFeeEstimate(): Promise<FeeEstimate> {
        return new Promise<FeeEstimate>((resolve, reject) => {
            resolve({fee: '0.000015', symbol: 'SOL'});
        });
    }

    public openTxOnBrowser(signature: string): void {
        void WebBrowser.openBrowserAsync(this.getExplorerUrlForTx(signature));
    }
}
