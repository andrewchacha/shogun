import {apiGet} from '@/utils/api/api';

export type UserSimple = {
    id: string;
    username: string;
    name: string;
    thumbnail: {
        uri: string;
        blurhash: string;
    };
};

export type UserSearchAddress = UserSimple & {
    address: string;
};

export function apiUserSearchAddresses(addresses: string[], chain: string) {
    return apiGet<UserSearchAddress[]>(`/user/search/addresses?addresses=${addresses.join(',')}&chain=${chain}`);
}

export type AccountSimple = {
    address: string;
    chain: string;
    signature: string;
};

export type SearchUsernameResponse = UserSimple & {
    accounts: AccountSimple[];
};

export function apiUserSearchUsername(username: string) {
    return apiGet<SearchUsernameResponse>(`/user/search/username/${username}`);
}
