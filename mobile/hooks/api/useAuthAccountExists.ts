import {useQuery} from '@tanstack/react-query';
import {apiAuthExists, ApiAuthParams} from '@/utils/api/authExists';
import {getChainOperations} from '@/chains/chainOperations';
import {getAccountStore} from '@/storage/accountStore';
import {Chain} from '@/chains/chain';
import bs58 from 'bs58';
import {ChainKey} from '@/utils/types/wallet';

export const useAuthAccountExists = (address: string, cached: boolean = false, enabled = true) => {
    return useQuery({
        enabled: !!address && enabled,
        queryKey: ['/auth/user/exists', address],
        staleTime: cached ? 15 * 1000 : 0,
        retry: 1,
        retryDelay: 3000,
        queryFn: async () => apiAuthExists(await getApiAuthParams(address)),
    });
};

function getApiAuthParams(mainAddress: string): Promise<ApiAuthParams> {
    const signer = getAccountStore().getChainKeyForAddress(mainAddress);
    if (!signer) {
        throw new Error('signer not found');
    }
    return getApiAuthParamsWithSigner(signer);
}

export async function getApiAuthParamsWithSigner(signer: ChainKey): Promise<ApiAuthParams> {
    const timestamp = `${Date.now()}`;
    const message = `/auth/exists/${signer.address}?timestamp=${timestamp}`;
    const ops = getChainOperations(Chain.Solana);
    const signature = await ops.signShogunMessage(signer, message);
    return {
        timestamp,
        signature,
        mainAddress: signer.address,
    };
}
