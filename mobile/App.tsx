import 'react-native-quick-crypto';
import 'text-encoding-polyfill';
import 'react-native-reanimated';
import 'react-native-gesture-handler';
import './polyfills';

import Toast from '@/components/Toast/Toast';
import {
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';

import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {useEncryptionStorage} from '@/hooks/storage/useEncryptionStorage';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Navigation from '@/navigation/Navigation';
import {encryptedStorage} from '@/storage/mmkv';
import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {useFonts} from 'expo-font';
import {StatusBar} from 'expo-status-bar';
import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {queryClient} from '@/storage/queryClient';
import {AppInit} from '@/AppInit';
import {shim} from 'react-native-quick-base64';
import Text from '@/components/Text/Text';

shim();

const clientStorage = {
    setItem: (key: string, value: any) => {
        encryptedStorage.set(key, value);
    },
    removeItem: (key: string) => {
        encryptedStorage.delete(key);
    },
    getItem: (key: string) => {
        const value = encryptedStorage.getString(key);
        return value === undefined ? null : value;
    },
};

const clientPersister = createSyncStoragePersister({storage: clientStorage});
void SplashScreen.preventAutoHideAsync();

export default function App() {
    const [encryptionStorageLoaded] = useEncryptionStorage();

    const theme = useAppTheme();
    const [fontsLoaded] = useFonts({
        'Font-100': Poppins_100Thin,
        'Font-200': Poppins_200ExtraLight,
        'Font-300': Poppins_300Light,
        'Font-400': Poppins_400Regular,
        'Font-500': Poppins_500Medium,
        'Font-600': Poppins_600SemiBold,
        'Font-700': Poppins_700Bold,
        'Font-800': Poppins_800ExtraBold,
        'Font-900': Poppins_900Black,
    });

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) await SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded || !encryptionStorageLoaded) {
        return null;
    }

    return (
        <SafeAreaProvider onLayout={onLayoutRootView}>
            <KeyboardProvider>
                <PersistQueryClientProvider client={queryClient} persistOptions={{persister: clientPersister}}>
                    <GestureHandlerRootView style={styles.rootView}>
                        <BottomSheetModalProvider>
                            <Navigation />
                            <AppInit />
                        </BottomSheetModalProvider>
                        <Toast />
                    </GestureHandlerRootView>
                    <StatusBar style={theme.isDark ? 'light' : 'dark'} />
                </PersistQueryClientProvider>
            </KeyboardProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    rootView: {
        flex: 1,
    },
});
