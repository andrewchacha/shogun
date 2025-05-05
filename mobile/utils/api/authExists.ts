import {apiGet} from '@/utils/api/api';

export const getApiAuthMessage = (mainAddress: string, timestamp: number) => {
    return `/auth/exists/${mainAddress}?timestamp=${timestamp}`;
};

export type AuthExistsResponse = {
    exists: boolean;
    id?: string;
    username?: string;
    thumbnail?: {
        uri: string;
        blurhash?: string;
    };
    name?: string;
};

export type ApiAuthParams = {
    timestamp: string;
    signature: string;
    mainAddress: string;
};

export function apiAuthExists({timestamp, signature, mainAddress}: ApiAuthParams) {
    return apiGet<AuthExistsResponse>(`/auth/exists/${mainAddress}?timestamp=${timestamp}&signature=${signature}`);
}
