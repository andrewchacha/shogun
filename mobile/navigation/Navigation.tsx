import {FontAwesome6, Ionicons} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {navigationRef} from '@/navigation/shared';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {DefaultTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import EncryptPassphrase from '@/screens/EncryptPassphrase/EncryptPassphrase';
import Discover from '@/screens/Main/Discover/Discover';
import MyProfile from '@/screens/Main/MyProfile/MyProfile';
import Chats from '@/screens/Main/Chats/Chats';
import WalletImport from '@/screens/WalletImport/WalletImport';
import WalletNew from '@/screens/WalletNew/WalletNew';
import Welcome from '@/screens/Welcome/Welcome';
import type {AppTheme} from '@/utils/styles';
import type React from 'react';
import {useMemo} from 'react';
import type {CommonStackList, MainTabParamList, RootStackParamList, RootStackScreenProps} from './types';
import ChatRoom from '@/screens/ChatRoom/ChatRoom';
import ChatRequests from '@/screens/ChatRequests/ChatRequests';
import Contacts from '@/screens/Contacts/Contacts';
import MyAddressQrCode from '@/screens/MyAddressQRCode/MyAddressQrCode';
import TokenList from '@/screens/TokenList/TokenList';
import Privacy from '@/screens/Privacy/Privacy';
import WalletRecovery from '@/screens/WalletRecovery/WalletRecovery';
import EditProfile from '@/screens/EditProfile/EditProfile';
import EditName from '@/screens/EditProfile/EditName';
import EditUsername from '@/screens/EditProfile/EditUsername';
import EditBio from '@/screens/EditProfile/EditBio';
import {TabMyProfile} from '@/navigation/TabMyProfile';
import {tabStyles} from '@/navigation/shared';
import SendCrypto from '@/screens/SendCrypto/SendCrypto';
import Swap from '@/screens/Swap/Swap';
import MultiAccountModal, {MultiAccountModalController} from '@/components/MultiAccountModal/MultiAccountModal';
import SendCryptoAddress from '@/screens/SendCrypto/SendCryptoAddress';
import SendCryptoConfirm from '@/screens/SendCrypto/SendCryptoConfirm';
import ScanQR from '@/screens/ScanQR/ScanQR';
import {getAccountStore} from '@/storage/accountStore';
import Settings from '@/screens/Settings/Settings';
import SettingsAccount from '@/screens/Settings/SettingsAccount';
import AddressBook from '@/screens/AddressBook/AddressBook';
import SearchUsername from '@/screens/SearchUsername/SearchUsername';
import SearchRafiki from '@/screens/SearchRafiki/SearchRafiki';
import RafikiList from '@/screens/RafikiList/RafikiList';

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
    const theme = useAppTheme();

    const navigationTheme = useMemo(() => {
        return {
            dark: theme.scheme === 'dark',
            colors: {
                ...DefaultTheme.colors,
                primary: theme.colors.primary,
                background: theme.colors.mainBackground,
                card: theme.colors.cardBackground,
                border: theme.colors.border,
                text: theme.colors.textPrimary,
                notification: theme.colors.textPrimary,
            },
        };
    }, [theme.scheme]);

    const initialRouteName = getAccountStore().currentAccountID() ? 'Main' : 'Welcome';
    return (
        <NavigationContainer theme={navigationTheme} ref={navigationRef}>
            <Stack.Navigator initialRouteName={initialRouteName}>
                <Stack.Group>
                    <Stack.Screen
                        name={'Welcome'}
                        component={Welcome}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                    />
                    <Stack.Screen
                        name={'Main'}
                        component={MainTabs}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                    />
                    <Stack.Screen
                        name={'WalletNew'}
                        component={WalletNew}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'WalletImport'}
                        component={WalletImport}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'ChatRoom'}
                        component={ChatRoom}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                </Stack.Group>
                <Stack.Group screenOptions={{presentation: 'modal'}}>
                    <Stack.Screen
                        name={'EncryptPassphrase'}
                        component={EncryptPassphrase}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'Contacts'}
                        component={Contacts}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'MyAddressQrCode'}
                        component={MyAddressQrCode}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'SendCryptoModal'}
                        component={SendCryptoStackNavigation}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                    />
                    <Stack.Screen
                        name={'Swap'}
                        component={Swap}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'ScanQR'}
                        component={ScanQR}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'SearchUsername'}
                        component={SearchUsername}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                    <Stack.Screen
                        name={'SearchRafiki'}
                        component={SearchRafiki}
                        options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                    />
                </Stack.Group>
            </Stack.Navigator>
            <MultiAccountModal />
        </NavigationContainer>
    );
};

export const CommonStackScreens = (
    Stack: ReturnType<typeof createNativeStackNavigator<CommonStackList>>,
    theme: AppTheme,
) => (
    <>
        <Stack.Screen
            name={'ChatRequests'}
            component={ChatRequests}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'TokenList'}
            component={TokenList}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'Privacy'}
            component={Privacy}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'WalletRecovery'}
            component={WalletRecovery}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'EditProfile'}
            component={EditProfile}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'EditName'}
            component={EditName}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'EditUsername'}
            component={EditUsername}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'EditBio'}
            component={EditBio}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'SendCryptoAddress'}
            component={SendCryptoAddress}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'SendCryptoConfirm'}
            component={SendCryptoConfirm}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'Settings'}
            component={Settings}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'SettingsAccount'}
            component={SettingsAccount}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'AddressBook'}
            component={AddressBook}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
        <Stack.Screen
            name={'RafikiList'}
            component={RafikiList}
            options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
        />
    </>
);

export const SendCryptoStack = createNativeStackNavigator<CommonStackList>();
const SendCryptoStackNavigation = ({route}: RootStackScreenProps<'SendCryptoModal'>) => {
    const theme = useAppTheme();
    return (
        <SendCryptoStack.Navigator>
            <SendCryptoStack.Group>
                <SendCryptoStack.Screen
                    name={'SendCrypto'}
                    component={SendCrypto}
                    initialParams={route.params}
                    options={({route}) => navigatorScreenOptions({route, theme, headerShown: true})}
                />
                {CommonStackScreens(SendCryptoStack, theme)}
            </SendCryptoStack.Group>
        </SendCryptoStack.Navigator>
    );
};

const ChatsStack = createNativeStackNavigator<CommonStackList>();
const ChatsStackNavigator: React.FC = () => {
    const theme = useAppTheme();
    return (
        <ChatsStack.Navigator>
            <ChatsStack.Group>
                <ChatsStack.Screen
                    name={'Chats'}
                    component={Chats}
                    options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                />
                {CommonStackScreens(ChatsStack, theme)}
            </ChatsStack.Group>
        </ChatsStack.Navigator>
    );
};

const MyProfileStack = createNativeStackNavigator<CommonStackList>();
const MyProfileStackNavigation: React.FC = () => {
    const theme = useAppTheme();
    return (
        <MyProfileStack.Navigator>
            <MyProfileStack.Group>
                <MyProfileStack.Screen
                    name={'MyProfile'}
                    component={MyProfile}
                    options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                />
                {CommonStackScreens(MyProfileStack, theme)}
            </MyProfileStack.Group>
        </MyProfileStack.Navigator>
    );
};

const DiscoverStack = createNativeStackNavigator<CommonStackList>();
const DiscoverStackStackNavigation: React.FC = () => {
    const theme = useAppTheme();
    return (
        <DiscoverStack.Navigator>
            <DiscoverStack.Group>
                <DiscoverStack.Screen
                    name={'Discover'}
                    component={Discover}
                    options={({route}) => navigatorScreenOptions({route, theme, headerShown: false})}
                />
                {CommonStackScreens(DiscoverStack, theme)}
            </DiscoverStack.Group>
        </DiscoverStack.Navigator>
    );
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MainTabs = () => {
    const theme = useAppTheme();

    return (
        <Tab.Navigator
            initialRouteName={'MyProfileTab'}
            screenOptions={{
                tabBarActiveTintColor: theme.colors.tabActiveTint,
                tabBarInactiveTintColor: theme.colors.tabInactiveTint,
                headerShown: false,
                tabBarShowLabel: false,
                headerStyle: {
                    backgroundColor: theme.colors.tabBackground,
                },
                tabBarStyle: {
                    backgroundColor: theme.colors.tabBackground,
                    borderTopWidth: 0,
                    borderBottomWidth: 0,
                },
            }}>
            <Tab.Screen
                name={'DiscoverTab'}
                component={DiscoverStackStackNavigation}
                options={{
                    tabBarLabel: '',
                    tabBarIcon: ({color, focused, size}) => (
                        <FontAwesome6 name="fly" size={size} color={color} style={tabStyles.icon} />
                    ),
                }}
            />
            <Tab.Screen
                name={'ChatsTab'}
                component={ChatsStackNavigator}
                options={{
                    tabBarLabel: 'Chats',
                    tabBarIcon: ({color, focused, size}) =>
                        focused ? (
                            <Ionicons name="chatbubble-ellipses" size={size} color={color} style={tabStyles.icon} />
                        ) : (
                            <Ionicons
                                name="chatbubble-ellipses-outline"
                                size={size}
                                color={color}
                                style={tabStyles.icon}
                            />
                        ),
                }}
            />
            <Tab.Screen
                name={'MyProfileTab'}
                component={MyProfileStackNavigation}
                listeners={({}) => ({
                    tabLongPress: () => {
                        MultiAccountModalController.show();
                    },
                })}
                options={() => ({
                    tabBarLabel: 'My Profile',
                    tabBarIcon: ({color, focused, size}) => (
                        <TabMyProfile color={color} focused={focused} size={size} />
                    ),
                })}
            />
        </Tab.Navigator>
    );
};

interface screenOptions {
    route?: any;
    theme: AppTheme;
    title?: string;
    headerShown?: boolean;
}

const navigatorScreenOptions = ({route, title, theme, headerShown}: screenOptions) => ({
    headerShown,
    title: route?.params?.title || title,
    headerTitleStyle: {
        ...theme.textVariants.nav,
        fontFamily: 'Font-600',
    },
    headerBackTitleStyle: {
        fontFamily: 'Font-600',
        fontSize: 14,
    },
    headerBackTitleVisible: false,
    headerBackTitle: '',
    headerStyle: {
        backgroundColor: theme.colors.stackHeaderBackground,
    },
    headerShadowVisible: false,
    headerTintColor: theme.colors.textPrimary,
});

export default Navigation;
