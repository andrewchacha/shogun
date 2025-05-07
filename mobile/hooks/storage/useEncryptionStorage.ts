import {StorageKeys} from '@/constants/storage';
import {Buffer} from '@craftzdog/react-native-buffer';
import {encryptedStorage, initEncryptedStorage} from '@/storage/mmkv';
import security from '@/storage/security';
import {useEffect, useState} from 'react';
import {MMKV} from 'react-native-mmkv';
import crypto from 'react-native-quick-crypto';
import bs58 from 'bs58';
import {SqlDB} from '@/storage/sqldb';
import {getAccountStore} from '@/storage/accountStore';

export const permanentStorage = new MMKV({id: 'shogun-store'});

const initStores = (encryptionKey: string) => {
    initEncryptedStorage(encryptionKey);
    SqlDB.getInstance().init(encryptionKey);
    getAccountStore();
};

//useEncryptionStorage - on app start, loads encrypted storage, makes a random key for encryption if one not present.
export function useEncryptionStorage() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        void run();
    }, []);

    const run = async () => {
        await checkFirstRun();
        await loadEncryptionKey();
        await checkDeviceID();
    };

    const checkFirstRun = async () => {
        const lastRun = permanentStorage.getNumber(StorageKeys.lastOpen);
        if (!lastRun) {
            await security.reset();
            permanentStorage.set(StorageKeys.lastOpen, Date.now());
        }
    };

    const checkDeviceID = async () => {
        const deviceID = encryptedStorage.getString(StorageKeys.deviceID);
        if (!deviceID) {
            const randomID = bs58.encode(Buffer.from(crypto.randomBytes(16)));
            encryptedStorage.set(StorageKeys.deviceID, randomID);
        }
    };

    async function loadEncryptionKey() {
        const encryptionKey = await security.getEncryptionKey();
        if (encryptionKey && encryptionKey.length > 0) {
            initStores(encryptionKey);
            setIsLoaded(true);
            return;
        }
        //Generating new random 256-bit key used to encrypt our storage and database.
        const randomKey = Buffer.from(crypto.randomBytes(32)).toString('hex');
        void security.storeEncryptionKey(randomKey);

        initStores(randomKey);
        setIsLoaded(true);
    }

    return [isLoaded];
}
