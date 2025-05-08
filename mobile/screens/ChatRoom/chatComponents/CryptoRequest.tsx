import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';
import Tag from '@/components/Tag/Tag';
import {Feather} from '@expo/vector-icons';
import CryptoRequestPayModal from '@/screens/ChatRoom/chatComponents/CryptoRequestPayModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useCallback, useRef} from 'react';
import Image from '@/components/Image/Image';

const ACCENT_COLOR = palette.teal500;
export function CryptoRequest() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const payModalRef = useRef<BottomSheetModal>(null);
    const openPayModal = useCallback(() => {
        payModalRef.current?.present();
    }, []);

    return (
        <View style={[styles.container, {borderColor: ACCENT_COLOR}]}>
            <View style={[styles.headerBack, {backgroundColor: ACCENT_COLOR}]}>
                <Image
                    uri={'https://cdn.midjourney.com/e54c36b6-2e11-43fa-80e0-9070b857c43e/0_0.webp'}
                    style={styles.thumbnail}
                />
                <View style={styles.headerInner}>
                    <Text style={styles.title}>Crypto Request</Text>
                    <Text style={styles.description} weight={'600'}>
                        Pay to join the Pizza Party
                    </Text>
                </View>
            </View>
            <View style={styles.innerWrap}>
                <View style={styles.innerWrapVert}>
                    <Text style={styles.amount}>500 USDC</Text>
                    <View style={styles.payOnWrap}>
                        <ChainLogo chain={'solana'} />
                        <Text>Pay on Solana</Text>
                    </View>
                </View>
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
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            borderRadius: rounded.xl,
            borderWidth: 1,
            overflow: 'hidden',
        },
        innerWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
        },
        innerWrapVert: {
            flex: 1,
        },
        headerBack: {
            alignItems: 'center',
            flexDirection: 'row',
            padding: spacing.s,
        },
        headerInner: {
            flex: 1,
        },
        thumbnail: {
            marginRight: spacing.m,
            borderRadius: 20,
            height: 40,
            width: 40,
        },
        title: {
            color: palette.white,
            fontSize: 12,
        },
        description: {
            color: palette.white,
            fontSize: 16,
        },
        amount: {
            fontSize: 20,
            fontFamily: 'Font-600',
        },
        payOnWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.xs,
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
