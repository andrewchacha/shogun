import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import Loading from '@/components/Loading/Loading';
import {Success} from '@/components/Animations/Success';
import Separator from '@/components/Separator/Separator';
import {SendCryptoConfirmParams} from '@/navigation/types';
import {MoneyTransferAnimation} from '@/screens/SendCrypto/components/MoneyTransferAnimation';
import React from 'react';

export const SendState = {
    broadcast: 1,
    confirming: 2,
    success: 3,
} as const;

export type SendState = (typeof SendState)[keyof typeof SendState];

type Props = SendCryptoConfirmParams & {
    sendState: SendState;
};

export function SendStateSending(props: Props) {
    const {sendState} = props;
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <View style={styles.container}>
            <MoneyTransferAnimation isSending={true} {...props} />
            <Separator space={spacing.xl} />
            <Text style={styles.sendingTitle}>Sending...</Text>
            <View style={styles.cardItem}>
                <View style={styles.animationWrap}>
                    {sendState === SendState.broadcast && <Loading isLoading={true} />}
                    {sendState > SendState.broadcast && <Success size={32} bgColor={theme.colors.secondary} />}
                </View>
                <Text style={styles.progressText}>Broadcasting to chain</Text>
            </View>
            <View style={styles.cardItem}>
                <View style={styles.animationWrap}>
                    {sendState === SendState.confirming && <Loading isLoading={true} size={'medium'} />}
                    {sendState > SendState.confirming && <Success size={32} bgColor={theme.colors.secondary} />}
                </View>
                <Text style={styles.progressText}>Confirming transaction</Text>
            </View>
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: spacing.xs,
        },
        sendingTitle: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-500',
            fontSize: 18,
        },
        cardItem: {
            ...theme.cardVariants.tag,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.m,
            gap: spacing.m,
            borderRadius: rounded.full,
            marginTop: spacing.m,
            justifyContent: 'center',
        },
        animationWrap: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        progressText: {
            color: theme.colors.textPrimary,
        },
    });
