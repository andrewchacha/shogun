import {Platform} from 'react-native';
import {encryptedStorage} from '@/storage/mmkv';
import {StorageKeys} from '@/constants/storage';
import {getAccountStore} from '@/storage/accountStore';

export type ApiHeaders = {
    Accept: string;
    Language: string;
    Device: string;
    'Content-Type'?: string;
    'Access-Token': string;
    OS: string;
    Version: string;
};

export const getHeaders = (showJsonContentType: boolean = true): ApiHeaders => {
    const platform = Platform.OS;
    const version = Platform.Version.toString();
    const language = encryptedStorage.getString(StorageKeys.language) || 'en';
    const deviceId = encryptedStorage.getString(StorageKeys.deviceID) || '';
    const currentAccount = getAccountStore().currentAccountID();
    const accessToken = encryptedStorage.getString(StorageKeys.accessToken(currentAccount)) || '';

    const h: ApiHeaders = {
        Accept: 'application/json',
        'Access-Token': accessToken,
        Language: language,
        Device: deviceId,
        OS: platform,
        Version: version,
    };
    if (showJsonContentType) {
        h['Content-Type'] = 'application/json';
    }
    return h;
};
