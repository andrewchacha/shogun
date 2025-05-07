import {Chain} from '@/chains/chain';
import {useQuery} from '@tanstack/react-query';
import {apiFetchWalletHistory} from '@/utils/api/walletTransaction';
import {queryClient} from '@/storage/queryClient';

export function useWalletHistory(address: string, chain: Chain, enabled: boolean = false) {
    return useQuery({
        enabled: enabled,
        queryKey: ['/wallet/history', address, chain],
        staleTime: 60 * 1000,
        retry: true,
        retryDelay: 6000,
        retryOnMount: false,
        queryFn: () => apiFetchWalletHistory(address, chain),
    });
}

export function invalidateWalletHistory(address: string, chain: Chain) {
    void queryClient.invalidateQueries({
        queryKey: ['/wallet/history', address, chain],
    });
}
