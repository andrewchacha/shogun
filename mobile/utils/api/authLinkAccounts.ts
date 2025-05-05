import {Keypair} from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {ApiStatus} from '@/utils/types/api';
import {API_URL} from '@/constants/server';
import {getHeaders} from '@/utils/api/apiHeaders';

export type LinkAccount = {
    address: string;
    chain: string;
    link_signature: string;
    proof_signature: string;
};

export async function apiLinkAccounts(signer: Keypair, accounts: LinkAccount[]) {
    const endpoint = '/auth/link';
    const body = JSON.stringify({
        public_key: signer.publicKey.toBase58(),
        timestamp: Date.now(),
        accounts,
    });
    const signMessage = `${endpoint}${body}`;
    const signature = bs58.encode(nacl.sign.detached(Buffer.from(signMessage), signer.secretKey));

    const response = await fetch(`${API_URL}${endpoint}?signature=${signature}`, {
        method: 'POST',
        headers: getHeaders(),
        body,
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
