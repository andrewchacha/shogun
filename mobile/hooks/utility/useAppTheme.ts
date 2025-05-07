import {useMemo} from 'react';
import {useAppColorScheme} from './useAppColorScheme';
import {AppTheme, darkTheme, lightTheme} from '@/utils/styles/theme';
import {DisplayTheme} from '@/utils/types/theme';

const appThemes = new Map<DisplayTheme, AppTheme>();
appThemes.set('light', lightTheme);
appThemes.set('dark', darkTheme);

export function useAppTheme() {
    const currTheme = useAppColorScheme();
    return useMemo<AppTheme>(() => {
        const t = appThemes.get(<DisplayTheme>currTheme);
        if (!t) return lightTheme;
        return t;
    }, [currTheme]);
}
