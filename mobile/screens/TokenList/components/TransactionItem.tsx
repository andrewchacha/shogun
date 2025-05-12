import React, {useCallback, useMemo, useRef} from 'react';
import {AppTheme, spacing, rounded, palette} from '@/utils/styles';
import {View, StyleSheet, Linking} from 'react-native';
import Text from '@/components/Text/Text';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {WalletTransaction} from '@/utils/api/walletTransaction';
import {DateLayout, formatDate} from '@/utils/helper/date';
import {AntDesign, FontAwesome, FontAwesome5, MaterialIcons} from '@expo/vector-icons';
import {hideMiddle} from '@/utils/helper/formatter';
import {formatAmount} from '@/utils/helper/numberFormatter';
import BigNumber from 'bignumber.js';
import Image from '@/components/Image/Image';
import Pressable from '@/components/Button/Pressable';
import {getChainOperations} from '@/chains/chainOperations';
import {Chain} from '@/chains/chain';

function TransactionItem(prop: WalletTransaction & {myAddress: string; chain: Chain}) {
    const {signature, timestamp, changes, failed, type, from_address, to_address, myAddress, user} = prop;
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {title, isOut}: {title: string; isOut: boolean} = useMemo(() => {
        if (type === 'transfer') {
            if (from_address === myAddress) {
                if (user?.username) return {title: `Sent to @${user.username}`, isOut: true};
                return {title: `Sent`, isOut: true};
            }
            if (to_address === myAddress) {
                if (user?.username) return {title: `Received from @${user.username}`, isOut: false};
                return {title: `Received`, isOut: false};
            }
        }
        if (type === 'swap') {
            let fromToken = '';
            let toToken = '';
            if (changes.length === 2) {
                for (let i = 0; i < changes.length; i++) {
                    if (new BigNumber(changes[i].ui_amount).isNegative()) {
                        fromToken = changes[i].symbol;
                    } else {
                        toToken = changes[i].symbol;
                    }
                }
            }
            if (fromToken && toToken) {
                return {title: `Swapped ${fromToken} to ${toToken}`, isOut: false};
            }
            return {title: 'Swapped', isOut: false};
        }
        return {title: 'Dapp Interaction', isOut: false};
    }, [type, user?.username, from_address, to_address, myAddress, changes]);

    const displayAddress = useMemo(() => {
        if (type === 'transfer') {
            if (from_address === myAddress) {
                return to_address;
            }
            if (to_address === myAddress) {
                return from_address;
            }
        }
        return '';
    }, [type, from_address, to_address, myAddress]);

    const openLink = useCallback(() => {
        const ops = getChainOperations(prop.chain);
        if (ops) {
            ops.openTxOnBrowser(signature);
        }
    }, [signature]);

    return (
        <Pressable style={styles.container} onPress={openLink}>
            <View style={styles.dateWrap}>
                <Text style={styles.timestamp}>{formatDate(timestamp, DateLayout.ShortHm)}</Text>
            </View>
            {user?.thumbnail.uri ? (
                <View style={styles.thumbWrap}>
                    <Image uri={user.thumbnail.uri} style={styles.thumbnail} />
                </View>
            ) : (
                <View
                    style={[
                        styles.thumbWrap,
                        type == 'transfer' ? (isOut ? styles.thumbWrapOut : styles.thumbWrapIn) : {},
                        type == 'swap' && styles.thumbWrapSwap,
                        type == 'unknown' && styles.thumbWrapUnknown,
                    ]}>
                    {type === 'transfer' && isOut && <AntDesign name="arrowup" style={styles.arrow} />}
                    {type === 'transfer' && !isOut && <AntDesign name="arrowdown" style={styles.arrow} />}
                    {type === 'swap' && <MaterialIcons name="swap-calls" style={styles.arrow} />}
                    {type === 'unknown' && <FontAwesome name="chain" style={styles.arrow} />}
                    <View style={[styles.statusWrap, {backgroundColor: failed ? palette.rose500 : palette.teal500}]}>
                        {failed && <FontAwesome5 name="times" style={styles.statusIcon} />}
                        {!failed && <FontAwesome5 name="check" style={styles.statusIcon} />}
                    </View>
                </View>
            )}
            <View style={styles.midWrap}>
                <Text style={styles.header}>{title}</Text>
                <Text style={styles.signature}>{hideMiddle(displayAddress)}</Text>
            </View>
            <View>
                {changes.map((c, index) => {
                    const isIncoming = new BigNumber(c.ui_amount).isGreaterThan(0);
                    return (
                        <Text key={index} style={[styles.amount, isIncoming && styles.incoming]}>
                            {isIncoming && '+'}
                            {formatAmount(c.ui_amount, {price: 1})} {c.symbol}
                        </Text>
                    );
                })}
            </View>
        </Pressable>
    );
}

export default React.memo(TransactionItem);

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.s,
            paddingVertical: spacing.s,
        },
        thumbWrap: {
            backgroundColor: palette.sky500,
            borderRadius: rounded.full,
            justifyContent: 'center',
            alignItems: 'center',
            height: 50,
            width: 50,
        },
        thumbWrapIn: {
            backgroundColor: palette.teal500,
        },
        thumbWrapOut: {
            backgroundColor: palette.rose500,
        },
        thumbWrapSwap: {
            backgroundColor: palette.amber500,
        },
        thumbWrapUnknown: {
            backgroundColor: palette.dark400,
        },
        thumbnail: {
            borderRadius: rounded.full,
            height: 50,
            width: 50,
        },
        arrow: {
            color: palette.white,
            fontSize: 32,
        },
        statusWrap: {
            borderRadius: rounded.full,
            borderColor: theme.colors.mainBackground,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            height: 18,
            width: 18,
            bottom: 0,
            right: 0,
        },
        statusIcon: {
            color: palette.white,
            fontSize: 9,
        },
        signature: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        midWrap: {
            flex: 1,
        },
        amount: {
            fontFamily: 'Font-600',
            textAlign: 'right',
            fontSize: 16,
        },
        incoming: {
            color: theme.isDark ? palette.teal400 : palette.teal600,
        },
        outgoing: {
            color: theme.colors.textPrimary,
        },
        header: {
            fontFamily: 'Font-500',
        },
        dateWrap: {
            width: 34,
        },
        timestamp: {
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
    });
