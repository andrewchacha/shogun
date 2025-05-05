import {apiGet} from '@/utils/api/api';

type System = {
    version: string;
    username_lock: number;
    name_lock: number;
    timestamp: number;
    bio_max_length: number;
    username_max_length: number;
    username_min_length: number;
    name_max_length: number;
};

export function apiFetchSystem() {
    return apiGet<System>('/system');
}
