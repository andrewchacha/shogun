import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps, NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Chain} from '@/chains/chain';
import {WalletAsset} from '@/utils/api/walletAssets';
import {TokenInfo} from '@/utils/api/tokenInfo';
import {SearchUsernameResponse} from '@/utils/api/userSearch';

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList, CommonStackList {}
    }
}

export type SendCryptoRecipient = {chain: Chain; address: string; username?: string; thumbnail?: string};
export type SendCryptoParams = {fromChain: Chain; fromTokenAddress: string};
export type SendCryptoAddressParams = SendCryptoParams & {
    fromToken: TokenInfo;
    fromTokenPrice?: string;
    fromAddress: string;
    uiAmount: string;
};
export type SendCryptoConfirmParams = SendCryptoAddressParams & {
    toAddress: string;
    toUser: SendCryptoRecipient;
};

//CommonStack - shared routes across all tabs
export type CommonStackList = {
    Chats: undefined;
    MyProfile: undefined;
    Discover: undefined;
    WalletSecure: {nextScreen: string};
    ChatRequests: undefined;
    TokenList: {address: string; chain: Chain};
    Privacy: undefined;
    WalletRecovery: undefined;
    EditProfile: undefined;
    EditName: undefined;
    EditUsername: undefined;
    EditBio: undefined;
    SendCrypto: SendCryptoParams;
    SendCryptoAddress: SendCryptoAddressParams;
    SendCryptoConfirm: SendCryptoConfirmParams;
    Settings: undefined;
    SettingsAccount: undefined;
    AddressBook: undefined;
    RafikiList: undefined;
};

export type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList> | undefined;
    Welcome: undefined;
    WalletNew: undefined;
    WalletImport: undefined;
    EncryptPassphrase: {passphrase: string};
    ChatRoom: undefined;
    Contacts: undefined;
    MyAddressQrCode: {address: string; chain: Chain};
    SendCryptoModal: SendCryptoParams;
    Swap: {fromChain: Chain; fromTokenAddress?: string};
    ScanQR: undefined;
    SearchUsername: {searchId: string};
    SearchRafiki: undefined;
};

export type CommonStackScreenProps<Screen extends keyof CommonStackList> = NativeStackScreenProps<
    CommonStackList,
    Screen
>;

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
    RootStackParamList,
    Screen
>;

export type AllStackParamList = CommonStackList & RootStackParamList;
export type AllStackScreenProps<Screen extends keyof AllStackParamList> = NativeStackScreenProps<
    AllStackParamList,
    Screen
>;

export type MainTabParamList = {
    ChatsTab: undefined;
    MyProfileTab: undefined;
    DiscoverTab: undefined;
};

export type RootTabScreenProps<Screen extends keyof MainTabParamList> = CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
>;
