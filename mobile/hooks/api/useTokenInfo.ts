import {useQuery} from '@tanstack/react-query';
import {apiFetchTokenInfo} from '@/utils/api/tokenInfo';
import {Chain} from '@/chains/chain';

export function useTokenInfo(address: string, chain: Chain, enabled: boolean = true) {
    return useQuery({
        enabled: !!address && enabled,
        staleTime: 1000 * 60 * 60 * 24 * 7, // 1 week
        retry: true,
        retryDelay: 5000,
        queryKey: ['/token/info/', address, chain],
        queryFn: () => apiFetchTokenInfo(address, chain),
    });
}
