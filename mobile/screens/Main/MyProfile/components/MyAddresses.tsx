import {AppTheme, hitSlop, spacing} from '@/utils/styles';
import {Share, StyleSheet, View} from 'react-native';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';
import {Chain} from '@/chains/chain';
import Text from '@/components/Text/Text';
import {capitalizeFirstLetter, hideMiddle} from '@/utils/helper/formatter';
import {Feather, FontAwesome6} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import React, {useCallback} from 'react';
import {ToastController} from '@/components/Toast/Toast';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {useCurrentKeys} from '@/storage/accountStoreHooks';

export function MyAddresses() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {result} = useCurrentKeys();
    if (!result) return null;
    return (
        <View style={styles.container}>
            {result.map(key => (
                <MyAddressItem key={key.address} chain={key.chain} address={key.address} />
            ))}
        </View>
    );
}

function MyAddressItem({chain, address}: {chain: Chain; address: string}) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const navigation = useNavigation();

    const onQrCode = useCallback(() => {
        navigation.navigate('MyAddressQrCode', {chain, address});
    }, [chain, address]);

    const onCopy = () => {
        void Clipboard.setStringAsync(address);
        ToastController.show({
            title: 'Copy',
            content: `${capitalizeFirstLetter(chain)} address copied to clipboard`,
            kind: 'info',
            timeout: 5000,
        });
    };

    const onShare = () => {
        void Share.share({
            message: `${capitalizeFirstLetter(chain)} address: ${address}`,
        });
    };

    return (
        <>
            <View style={styles.chainWrap}>
                <ChainLogo chain={chain} style={styles.chainLogo} />
                <Text style={styles.address}>{hideMiddle(address, 6)}</Text>
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
        </>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {},
        chainWrap: {
            borderColor: theme.colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.xs,
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
            fontFamily: 'Font-400',
        },
        actionIcon: {
            color: theme.colors.textSecondary,
            padding: spacing.s,
            fontSize: 16,
        },
    });
