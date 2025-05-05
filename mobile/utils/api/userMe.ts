import {apiGet} from '@/utils/api/api';
import {Media} from '@/utils/types/media';

export type Me = {
    id: string;
    username: string;
    bio?: string;
    name?: string;
    thumbnail?: Media;
    meta?: Record<string, any>;
    created_at: string;
    updated_at: string;
    accounts: AccountSimple[];
};

export type AccountSimple = {
    address: string;
    chain: string;
    signature: string;
};

export function apiUserMe() {
    return apiGet<Me>('/user/me');
}
