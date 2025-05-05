import {encryptedStorage} from '@/storage/mmkv';
import {StorageKeys} from '@/constants/storage';

function store(publicKey: string, accessToken: string, expiresIn: number): void {
    encryptedStorage.set(StorageKeys.accessToken(publicKey), accessToken);
    const expireAt = Date.now() + expiresIn * 1000;
    encryptedStorage.set(StorageKeys.accessTokenExpireAt(publicKey), expireAt);
}

function get(publicKey: string) {
    return encryptedStorage.getString(StorageKeys.accessToken(publicKey));
}

function getExpireAt(publicKey: string) {
    return encryptedStorage.getNumber(StorageKeys.accessTokenExpireAt(publicKey));
}

export const AccessToken = {
    store,
    get,
    getExpireAt,
};
