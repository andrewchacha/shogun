import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme} from '@/utils/styles/theme';
import React, {memo, useCallback, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/Text/Text';
import {palette, rounded, spacing} from '@/utils/styles';
import {Feather} from '@expo/vector-icons';
import CryptoRequestPayModal from '@/screens/ChatRoom/chatComponents/CryptoRequestPayModal';
import Tag from '@/components/Tag/Tag';
import {BottomSheetModal} from '@gorhom/bottom-sheet';

export const PayRequest = memo(
    ({
        amount,
        reason,
        chain,
        address,
        coin,
    }: {
        amount: number;
        reason: string;
        chain: string;
        address: string;
        coin: string;
    }) => {
        const theme = useAppTheme();
        const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

        const payModalRef = useRef<BottomSheetModal>(null);
        const openPayModal = useCallback(() => {
            payModalRef.current?.present();
        }, []);

        return (
            <View style={styles.container}>
                <View style={{flex: 1}}>
                    <Text style={styles.title} weight="600">
                        Pay Request
                    </Text>
                    <Text style={styles.reason}>{reason}</Text>
                </View>
                <View style={styles.innerWrap}>
                    <Text style={styles.amount} weight="600">
                        {amount} {coin}
                    </Text>
                    <Tag
                        title={'Pay Now'}
                        textStyle={styles.payText}
                        icon={<Feather name="arrow-right" style={styles.payIcon} />}
                        onPress={openPayModal}
                    />
                </View>

                <CryptoRequestPayModal ref={payModalRef} />
            </View>
        );
    },
);

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            padding: spacing.s,
            gap: spacing.m,
            borderRadius: rounded.l,
            backgroundColor: palette.teal500,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.s,
        },
        title: {
            color: palette.white,
            fontSize: 14,
        },
        reason: {
            color: palette.white,
            fontSize: 14,
        },
        innerWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.cardBackground,
            padding: spacing.m,
            borderRadius: rounded.l,
            gap: spacing.m,
        },
        amount: {
            fontSize: 18,
        },
        payButton: {
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.s,
            width: 70,
            borderRadius: rounded.m,
        },
        payText: {
            color: theme.colors.primary,
            fontFamily: 'Font-600',
        },
        payIcon: {
            color: theme.colors.textPrimary,
            fontSize: 16,
        },
    });
