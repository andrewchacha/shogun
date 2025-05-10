import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps, RootStackScreenProps} from '@/navigation/types';
import {palette, rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {Keyboard, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';

const ScanQR = ({navigation, route}: RootStackScreenProps<'ScanQR'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Scan Qr Code',
        });
    }, [navigation.setOptions, theme.colors.textPrimary]);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Text>Scan QR Code</Text>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        container: {
            flex: 1,
        },
    });

export default ScanQR;
