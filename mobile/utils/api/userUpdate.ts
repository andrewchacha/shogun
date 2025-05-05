import {apiPost} from '@/utils/api/api';
import {ApiSuccess} from '@/utils/types/api';

export type UserUpdatable = {
    username?: string;
    name?: string;
    bio?: string;
};

export function apiUserUpdate(user: UserUpdatable) {
    return apiPost<ApiSuccess>('/user/update', user);
}
