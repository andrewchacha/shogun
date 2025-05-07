import {useQuery} from '@tanstack/react-query';
import {apiUserMe} from '@/utils/api/userMe';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';

export function useMe(enabled: boolean) {
    const currentAccountID = useCurrentAccountID();
    return useQuery({
        enabled: enabled && !!currentAccountID,
        queryKey: ['/auth/me', currentAccountID],
        retry: 2000,
        retryDelay: 2000,
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
        queryFn: () => apiUserMe(),
    });
}
