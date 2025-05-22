import Text from '@/components/Text/Text';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useMemo} from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import {rounded, spacing} from '@/utils/styles';
import {useAtomValue} from 'jotai';
import {totalsAtom} from '@/screens/Main/MyProfile/totalValue';
import {formatAmount} from '@/utils/helper/numberFormatter';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useCurrentKeys} from '@/storage/accountStoreHooks';
import BigNumber from 'bignumber.js';
import {Chain, ChainColors} from '@/chains/chain';

export const WalletValue = React.memo(() => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {result: keys} = useCurrentKeys();
    const walletsValue = useAtomValue(totalsAtom);

    const totalWalletValue = useMemo(() => {
        if (!keys) return new BigNumber(0);
        return keys.reduce((acc, key) => acc.plus(walletsValue[key.address] || 0), new BigNumber(0));
    }, [walletsValue, keys]);

    const {width} = useWindowDimensions();
    const walletsWidth: {chain: Chain; width: number}[] = useMemo(() => {
        if (!keys) return [];
        if (totalWalletValue.isZero()) return [];

        const nonZeroKeys = keys.filter(key => new BigNumber(walletsValue[key.address] || 0).gt(0));
        const widths = [];
        for (let key of keys) {
            if (key.chain === Chain.Solana) continue;
            const ratio = new BigNumber(walletsValue[key.address] || 0).div(totalWalletValue).toNumber();
            if (ratio <= 0) continue;
            let w = 0;
            if (nonZeroKeys.length === 1) {
                w = ratio * width - 2 * spacing.th;
            } else {
                w = ratio * width - spacing.s / nonZeroKeys.length - spacing.th;
            }
            widths.push({chain: key.chain, width: w});
        }
        return widths;
    }, [totalWalletValue, width]);

    return (
        <View>
            <Text style={styles.title} weight={'500'}>
                Total balance
            </Text>
            <Text style={styles.text} weight={'600'}>
                ${formatAmount(totalWalletValue, {price: 1})}
            </Text>
            {/* <View style={styles.drawWrap}>
                {walletsWidth.map(({chain, width}, index) => {
                    return (
                        <View key={chain} style={{width: width}}>
                            <View
                                key={index}
                                style={{
                                    height: 4,
                                    width: '100%',
                                    borderRadius: rounded.full,
                                    backgroundColor: ChainColors[chain],
                                }}
                            />
                            <Text color={'secondary'} style={styles.chain}>
                                {chain}
                            </Text>
                        </View>
                    );
                })}
            </View> */}
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        text: {
            color: theme.colors.textPrimary,
            marginTop: spacing.xs,
            fontSize: 36,
        },
        title: {
            color: theme.colors.textSecondary,
            marginTop: spacing.m,
        },
        drawWrap: {
            flexDirection: 'row',
            gap: spacing.s,
            width: '100%',
            marginTop: spacing.s,
            marginBottom: spacing.l,
        },
        chain: {
            textTransform: 'capitalize',
            marginTop: spacing.xs,
            fontSize: 12,
        },
    });
