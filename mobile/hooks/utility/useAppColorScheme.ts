import {StorageKeys} from '@/constants/storage';
import type {DisplayTheme} from '@/utils/types/theme';
import {useCallback, useMemo} from 'react';
import {type ColorSchemeName, useColorScheme} from 'react-native';
import {useMMKVString} from 'react-native-mmkv';

export function useAppColorScheme() {
    const systemColor = useColorScheme() as NonNullable<ColorSchemeName>;
    const [currentTheme] = useMMKVString(StorageKeys.theme);
    const current = currentTheme || 'system';
    return useMemo(() => (current === 'system' ? systemColor : current), [current, systemColor]);
}

export function useAppColorSchemeChanger() {
    const [appTheme, setAppTheme] = useMMKVString(StorageKeys.theme);
    const setTheme = useCallback(
        (theme: DisplayTheme) => {
            return setAppTheme(theme);
        },
        [setAppTheme],
    );

    return {colorScheme: appTheme as DisplayTheme, setColorScheme: setTheme};
}
