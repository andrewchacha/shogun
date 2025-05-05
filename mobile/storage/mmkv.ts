import {MMKV} from 'react-native-mmkv';

export let encryptedStorage: MMKV;
export const initEncryptedStorage = (encryptionKey: string) => {
    encryptedStorage = new MMKV({
        id: 'shogun-encrypted-store',
        encryptionKey: encryptionKey,
    });
};
