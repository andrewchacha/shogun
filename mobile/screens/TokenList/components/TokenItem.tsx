import React, {useCallback, useRef} from 'react';
import {AppTheme, spacing, rounded} from '@/utils/styles';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/Text/Text';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Image from '@/components/Image/Image';
import Pressable from '@/components/Button/Pressable';
import {hideMiddle} from '@/utils/helper/formatter';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import TokenDetailModal from '@/screens/TokenList/components/TokenDetailModal';
import {WalletAsset} from '@/utils/api/walletAssets';
import {formatAmount} from '@/utils/helper/numberFormatter';

export default function TokenItem(prop: WalletAsset) {
    const {address, symbol, name, logo, ui_amount, price, total} = prop;
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const tokenDetailModal = useRef<BottomSheetModal>(null);
    const openTokenDetailModal = useCallback(() => {
        tokenDetailModal.current?.present();
    }, []);

    return (
        <>
            <Pressable style={styles.container} onPress={openTokenDetailModal}>
                <Image uri={logo} style={styles.logo} />
                <View style={styles.midContainer}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.address}>{hideMiddle(address)}</Text>
                </View>
                <View style={styles.amountWrap}>
                    <Text style={styles.amount} weight={'500'}>
                        {formatAmount(ui_amount, {price})} {symbol}
                    </Text>
                    <Text style={styles.estimate}>${formatAmount(total, {price: 1})}</Text>
                </View>
            </Pressable>
            <TokenDetailModal ref={tokenDetailModal} {...prop} />
        </>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.tag,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
            borderRadius: rounded.xl,
        },
        logo: {
            borderRadius: rounded.full,
            marginRight: spacing.s,
            height: 32,
            width: 32,
        },
        midContainer: {
            flex: 1,
        },
        estimate: {
            color: theme.colors.textSecondary,
            fontSize: 13,
        },
        name: {},
        amount: {},
        amountWrap: {
            alignItems: 'flex-end',
        },
        address: {
            color: theme.colors.textTertiary,
            fontSize: 14,
        },
    });
