import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import React, {useLayoutEffect, useState} from 'react';
import {StyleSheet, View, ScrollView, Animated} from 'react-native';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {RecoverWarning} from '@/screens/WalletRecovery/RecoveryWarning';
import {RecoveryShow} from '@/screens/WalletRecovery/RecoveryShow';

//TODO use biometrics or password first before showing the key
const WalletRecovery = ({navigation}: CommonStackScreenProps<'WalletRecovery'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [isShow, setIsShow] = useState(false);
    const onShow = () => {
        setIsShow(true);
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Recovery phrase',
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {isShow ? <RecoveryShow /> : <RecoverWarning onShow={onShow} />}
        </ScrollView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.th,
            paddingVertical: spacing.th,
        },
        section: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.l,
            padding: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
            marginTop: spacing.l,
        },
        iconBack: {
            backgroundColor: theme.colors.warning + '44',
            borderRadius: rounded.full,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 48,
            height: 48,
        },
        icon: {
            color: theme.colors.warning,
            fontSize: 24,
        },
        text: {
            fontFamily: 'Font-500',
            flex: 1,
        },
        readCarefully: {
            color: theme.colors.warning,
            marginTop: spacing.l,
        },
        checkWrap: {
            paddingHorizontal: spacing.m,
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkbox: {
            borderColor: theme.colors.textPrimary,
            borderRadius: rounded.m,
            marginRight: spacing.m,
            borderWidth: 2,
            height: 28,
            width: 28,
        },
        checkboxInner: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        understandText: {
            flex: 1,
        },
    });

export default WalletRecovery;
