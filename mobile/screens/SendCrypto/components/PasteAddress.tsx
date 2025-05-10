import {StyleSheet, View} from 'react-native';
import {FontAwesome5} from '@expo/vector-icons';
import Text from '@/components/Text/Text';
import React, {useLayoutEffect, useState} from 'react';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Pressable from '@/components/Button/Pressable';
import * as Clipboard from 'expo-clipboard';
import {Chain} from '@/chains/chain';
import {getChainOperations} from '@/chains/chainOperations';
import * as Haptics from 'expo-haptics';

type Props = {
    chain: Chain;
    onAddress: (address: string) => void;
};

export function PasteAddress({chain, onAddress}: Props) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [clipboardAddress, setClipboardAddress] = useState('');

    useLayoutEffect(() => {
        void getClipboardAddress();
    }, []);

    const getClipboardAddress = async () => {
        const clipboardAddress = await Clipboard.getStringAsync();
        if (clipboardAddress.length > 100) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return;
        }
        const ops = getChainOperations(chain);
        if (!ops || !ops.verifyAddress(clipboardAddress)) {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return;
        }
        setClipboardAddress(clipboardAddress);
    };

    const onPress = async () => {
        const newClip = await Clipboard.getStringAsync();
        if (newClip.length > 100 || !isValidAddress(chain, newClip)) {
            if (clipboardAddress) {
                onAddress(clipboardAddress);
                return;
            }
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return;
        }
        onAddress(newClip);
    };

    return (
        <Pressable style={styles.pasteWrapper} onPress={onPress}>
            <View style={styles.pasteIconWrap}>
                <FontAwesome5 name="paste" style={styles.pasteIcon} />
            </View>
            <View style={styles.pasteInnerWrap}>
                <Text style={styles.pasteTitle}>Paste from clipboard</Text>
                {clipboardAddress && <Text style={styles.pasteAddress}>{clipboardAddress}</Text>}
            </View>
        </Pressable>
    );
}

const isValidAddress = (chain: Chain, address: string) => {
    const ops = getChainOperations(chain);
    if (!ops) {
        return false;
    }
    return ops.verifyAddress(address);
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        pasteWrapper: {
            backgroundColor: theme.colors.cardBackground + '55',
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            borderRadius: rounded.l,
            marginTop: spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.m,
            gap: spacing.m,
        },
        pasteIconWrap: {
            backgroundColor: theme.colors.textTertiary,
            borderRadius: rounded.full,
            justifyContent: 'center',
            alignItems: 'center',
            height: 36,
            width: 36,
        },
        pasteIcon: {
            color: theme.colors.white,
            padding: spacing.s,
            fontSize: 16,
        },
        pasteInnerWrap: {
            flex: 1,
        },
        pasteTitle: {
            color: theme.colors.textSecondary,
        },
        pasteAddress: {
            fontFamily: 'Font-500',
            fontSize: 14,
        },
    });
