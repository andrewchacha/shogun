import {useLayoutEffect} from 'react';

import * as SystemUI from 'expo-system-ui';
import {palette} from '@/utils/styles';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {Platform} from 'react-native';

export function useModalBackground() {
    const theme = useAppTheme();
    useLayoutEffect(() => {
        //used in presentation modals, only works in ios
        if (Platform.OS !== 'ios') {
            return;
        }
        if (theme.isDark) {
            void SystemUI.setBackgroundColorAsync(palette.dark700);
        } else {
            void SystemUI.setBackgroundColorAsync(palette.dark300);
        }
        return () => {
            void SystemUI.setBackgroundColorAsync(theme.colors.mainBackground);
        };
    }, [theme.scheme]);
}
