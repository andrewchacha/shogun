import {AppTheme, hitSlop, spacing} from '@/utils/styles';
import {Share, StyleSheet, View} from 'react-native';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {Chain} from '@/chains/chain';
import {capitalizeFirstLetter} from '@/utils/helper/formatter';
import {Feather, FontAwesome6} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import React, {useCallback} from 'react';
import {ToastController} from '@/components/Toast/Toast';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';

export function AddressActions({chain, address}: {chain: Chain; address: string}) {
    const navigation = useNavigation();
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onCopy = useCallback(() => {
        void Clipboard.setStringAsync(address);
        ToastController.show({
            title: 'Copy',
            content: `${capitalizeFirstLetter(chain)} address copied to clipboard`,
            kind: 'info',
            timeout: 5000,
        });
    }, [chain, address]);

    const onQrCode = useCallback(() => {
        navigation.navigate('MyAddressQrCode', {chain, address});
    }, [chain, address]);

    const onShare = () => {
        void Share.share({
            message: `${capitalizeFirstLetter(chain)} address: ${address}`,
        });
    };

    return (
        <View style={styles.chainWrap}>
            <Pressable hitSlop={hitSlop} onPress={onShare}>
                <Feather name="share" style={styles.actionIcon} />
            </Pressable>
            <Pressable hitSlop={hitSlop} onPress={onCopy}>
                <FontAwesome6 name="copy" style={styles.actionIcon} />
            </Pressable>
            <Pressable hitSlop={hitSlop} onPress={onQrCode}>
                <FontAwesome6 name="qrcode" style={styles.actionIcon} />
            </Pressable>
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.tagMute,
            padding: spacing.s,
            gap: spacing.s,
        },
        chainWrap: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        chainLogo: {
            width: 24,
            height: 24,
            marginRight: spacing.s,
        },
        address: {
            color: theme.colors.textSecondary,
            fontSize: 14,
            flex: 1,
        },
        actionIcon: {
            color: theme.colors.textSecondary,
            padding: spacing.s,
            fontSize: 16,
        },
    });
