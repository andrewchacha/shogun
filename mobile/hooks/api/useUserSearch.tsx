import {useQuery} from '@tanstack/react-query';
import {apiUserSearchAddresses} from '@/utils/api/userSearch';
import {Chain} from '@/chains/chain';

export function useUserSearchAddresses(addresses: string[], chain: Chain) {
    return useQuery({
        enabled: addresses.length > 0,
        queryKey: ['/user/search/addresses', addresses, chain],
        staleTime: 15 * 60 * 1000,
        retry: 10,
        retryDelay: 2000,
        queryFn: () => apiUserSearchAddresses(addresses, chain),
    });
}
