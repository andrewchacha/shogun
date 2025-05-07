import {useMe} from '@/hooks/api/useMe';
import {apiUserUpdate, UserUpdatable} from '@/utils/api/userUpdate';
import {useState} from 'react';

export function useUserUpdater() {
    const {refetch} = useMe(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const runUpdate = async (user: UserUpdatable) => {
        setIsUpdating(true);
        try {
            const res = await apiUserUpdate(user);
            if (res.data?.success) {
                void refetch();
            }
        } catch (e) {
            setIsUpdating(false);
            throw e;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        isUpdating,
        runUpdate,
    };
}
