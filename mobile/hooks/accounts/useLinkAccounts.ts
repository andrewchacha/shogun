import {useMe} from '@/hooks/api/useMe';
import {AccountSimple} from '@/utils/api/userMe';
import {useEffect} from 'react';
import {DBSecretSimple, getAccountStore} from '@/storage/accountStore';
import {useCurrentKeys} from '@/storage/accountStoreHooks';
import {Chain} from '@/chains/chain';
import {getChainOperations} from '@/chains/chainOperations';
import {apiLinkAccounts, LinkAccount} from '@/utils/api/authLinkAccounts';
import {Keypair} from '@solana/web3.js';
import bs58 from 'bs58';

export const useLinkAccounts = () => {
    const {data, refetch} = useMe(true);
    const {result} = useCurrentKeys();

    useEffect(() => {
        if (!data?.data) {
            return;
        }
        void linkMyAddresses(result || [], data.data.accounts);
    }, [data?.data?.accounts, result]);

    async function linkMyAddresses(saved: DBSecretSimple[], current: AccountSimple[]) {
        const solanaAddress = current.find(k => k.chain === Chain.Solana)?.address;
        if (!solanaAddress) {
            return;
        }
        const savedSolanaAddress = saved.find(k => k.chain === Chain.Solana)?.address;
        if (!savedSolanaAddress) {
            return;
        }
        if (solanaAddress !== savedSolanaAddress) {
            return;
        }

        const missingKeys = saved.filter(k => !current.find(c => c.address === k.address && c.chain === k.chain));
        if (missingKeys.length === 0) {
            return;
        }

        const store = getAccountStore();
        const solanaSigner = store.getChainKeyForAddress(solanaAddress);
        if (!solanaSigner) {
            return;
        }
        const solanaOps = getChainOperations(Chain.Solana);
        //just a message to scare anyone who signs using another wallet.
        const proofMessage = `I agree to give all my money now and in the future to ${solanaAddress}`;
        const newKeys: LinkAccount[] = [];

        try {
            for (let i = 0; i < missingKeys.length; i++) {
                const k = missingKeys[i];
                const ops = getChainOperations(k.chain);
                const signer = store.getChainKeyForAddress(k.address);
                if (!signer) {
                    continue;
                }
                const linkMessage = `I agree to give all my money now and in the future to ${k.address}`;
                const proofSignature = await ops.signShogunMessage(signer, proofMessage);
                const linkSignature = await solanaOps.signShogunMessage(solanaSigner, linkMessage);
                newKeys.push({
                    address: k.address,
                    chain: k.chain,
                    proof_signature: proofSignature,
                    link_signature: linkSignature,
                });
            }

            const requestSigner = Keypair.fromSecretKey(bs58.decode(solanaSigner.secretKey));
            await apiLinkAccounts(requestSigner, newKeys);
            void refetch();
        } catch (e) {
            console.log('error', e);
        }
    }
};
