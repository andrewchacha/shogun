import {useQuery} from '@tanstack/react-query';
import {apiFetchSystem} from '@/utils/api/system';

export function useSystem() {
    return useQuery({
        queryKey: ['/system'],
        staleTime: 1000 * 60 * 60,
        refetchInterval: 1000 * 60 * 60,
        retry: true,
        retryDelay: 3000,
        queryFn: () => apiFetchSystem(),
    });
}
