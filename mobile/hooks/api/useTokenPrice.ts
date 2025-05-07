import {useQuery} from '@tanstack/react-query';
import {apiFetchTokenPrice} from '@/utils/api/tokenPrice';

export function useTokenPrice(address: string, enabled: boolean = true) {
    return useQuery({
        enabled: !!address && enabled,
        staleTime: 1000 * 10,
        retry: 10,
        retryDelay: 1000 * 15,
        queryKey: ['/token/price/', address],
        queryFn: () => apiFetchTokenPrice(address),
    });
}
