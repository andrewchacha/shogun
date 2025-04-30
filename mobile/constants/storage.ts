export const StorageKeys = {
    theme: 'app-theme',
    usePushNotifications: 'push-notifications',
    language: 'language',
    hideBalance: 'hide-balance',
    deviceID: 'device-id',
    lastOpen: 'last-open',
    lockMethod: 'lock-method',
    currentAccountID: 'current-account-id',
    accessToken: (publicKey: string) => `access-token-${publicKey}`,
    accessTokenExpireAt: (publicKey: string) => `access-token-expire-at-${publicKey}`,
};
