import {Chain} from '@/chains/chain';
import {useQuery} from '@tanstack/react-query';
import {apiFetchWalletAssets} from '@/utils/api/walletAssets';

export function useWalletAssets(address: string, chain: Chain, enabled: boolean = true) {
    return useQuery({
        enabled: enabled,
        queryKey: ['/wallet/assets', address, chain],
        staleTime: 15 * 1000,
        retry: true,
        retryDelay: 3000,
        retryOnMount: false,
        queryFn: () => apiFetchWalletAssets(address, chain),
    });
}
