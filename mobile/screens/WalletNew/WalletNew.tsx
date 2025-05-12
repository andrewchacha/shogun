import LoadingGlobe from '@/components/LoadingGlobe/LoadingGlobe';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import {GenerateWallet} from '@/screens/WalletNew/GenerateWallet';
import {WalletWarning} from '@/screens/WalletNew/WalletWarning';
import {palette, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

type Mode = 'warning' | 'generate';
const WalletNew = ({navigation}: RootStackScreenProps<'WalletNew'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [mode, setMode] = useState<Mode>('warning');

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Create New Pass',
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <LoadingGlobe size={400} color={palette.rose500} containerStyle={styles.backAnimation} noBorder={true} />
            {mode === 'warning' && <WalletWarning onNext={() => setMode('generate')} />}
            {mode === 'generate' && <GenerateWallet />}
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: spacing.th,
            marginVertical: spacing.xl,
            flex: 1,
        },
        backAnimation: {
            position: 'absolute',
            top: 0,
            right: -200,
            opacity: theme.isDark ? 0.1 : 0.2,
        },
    });

export default WalletNew;
