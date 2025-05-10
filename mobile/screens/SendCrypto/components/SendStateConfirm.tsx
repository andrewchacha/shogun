import {SendCryptoConfirmParams} from '@/navigation/types';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View, Text as NativeText} from 'react-native';
import Text from '@/components/Text/Text';
import {formatAmount} from '@/utils/helper/numberFormatter';
import Separator from '@/components/Separator/Separator';
import {hideMiddle} from '@/utils/helper/formatter';
import Image from '@/components/Image/Image';
import Button from '@/components/Button/Button';
import React, {useEffect, useMemo, useState} from 'react';
import BigNumber from 'bignumber.js';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useMe} from '@/hooks/api/useMe';
import {getChainOperations} from '@/chains/chainOperations';
import {FeeEstimate} from '@/chains/chainInterface';

type Props = SendCryptoConfirmParams & {
    onConfirm: (fee?: FeeEstimate) => void;
    onCancel: () => void;
};

export function SendStateConfirm({
    fromChain,
    fromTokenPrice,
    toAddress,
    fromToken,
    fromAddress,
    uiAmount,
    toUser,
    onConfirm,
    onCancel,
}: Props) {
    const {data: me} = useMe(true);
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [feeEstimate, setFeeEstimate] = useState<FeeEstimate | undefined>(undefined);
    useEffect(() => {
        void estimateFee();
    }, [fromAddress, toAddress, uiAmount, fromToken]);

    const estimateFee = async () => {
        const ops = getChainOperations(fromChain);
        const fee = await ops.getFeeEstimate(fromAddress, toAddress, uiAmount, fromToken);
        if (fee.fee) {
            setFeeEstimate(fee);
        }
    };

    const usdValue = new BigNumber(uiAmount).times(fromTokenPrice || 0);
    const networkFeeUsd = new BigNumber(feeEstimate?.fee || 0).times(160);
    const fontSize = uiAmount.length > 6 ? 40 : 54;

    const handleConfirm = () => {
        onConfirm(feeEstimate);
    };

    return (
        <>
            <View style={styles.innerWrap}>
                <Text style={[styles.amount, {fontSize}]}>
                    {uiAmount}
                    <NativeText style={[styles.currency, {fontSize}]}> {fromToken.symbol}</NativeText>
                </Text>
                <Text style={styles.usdValue}>
                    ~{usdValue.isGreaterThan(0) && formatAmount(usdValue, {price: 1})} USD
                </Text>
                <Separator space={spacing.xl} />
                <View style={styles.rowWrap}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.rowLabel}>From</Text>
                        <Text style={styles.chain}>{fromChain}</Text>
                    </View>
                    <View style={styles.rowRight}>
                        <Text style={styles.username}>@{me?.data?.username}</Text>
                        <Text style={styles.address}>{hideMiddle(fromAddress)}</Text>
                    </View>
                    <Image
                        uri={me?.data?.thumbnail?.uri}
                        blurHash={me?.data?.thumbnail?.blurhash}
                        style={styles.thumbnail}
                    />
                </View>
                <View style={styles.rowWrap}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.rowLabel}>To</Text>
                        <Text style={styles.chain}>{fromChain}</Text>
                    </View>
                    <View style={styles.rowRight}>
                        {toUser.username && <Text style={styles.username}>@{toUser.username}</Text>}
                        <Text style={styles.address}>{hideMiddle(toAddress)}</Text>
                    </View>
                    {toUser.thumbnail && <Image uri={toUser.thumbnail} style={styles.thumbnail} />}
                </View>

                <View style={[styles.rowWrap, styles.lastRow]}>
                    <View style={styles.rowLeft}>
                        <Text style={styles.rowLabel}>Network Fee</Text>
                    </View>
                    <View style={styles.rowRight}>
                        <Text style={styles.rowValue}>
                            {feeEstimate?.fee} {feeEstimate?.symbol}
                        </Text>
                        <Text style={styles.feeEstimate}>~{formatAmount(networkFeeUsd, {price: 1})} USD</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <Button
                    title={'Cancel'}
                    onPress={onCancel}
                    variant={'secondary'}
                    containerStyle={styles.actionButton}
                />
                <Button title={'Confirm'} onPress={handleConfirm} containerStyle={styles.actionButton} />
            </View>
        </>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        innerWrap: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        amount: {
            fontFamily: 'Font-800',
            textAlign: 'center',
        },
        currency: {
            color: theme.colors.textTertiary,
        },
        usdValue: {
            fontFamily: 'Font-600',
            color: theme.colors.textSecondary,
        },
        rowWrap: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
            paddingVertical: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
        },
        lastRow: {
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
        rowLabel: {},
        chain: {
            textTransform: 'capitalize',
            color: theme.colors.textSecondary,
        },
        rowInfo: {
            fontFamily: 'Font-500',
            fontSize: 12,
        },
        rowLeft: {
            flex: 1,
        },
        rowRight: {
            alignItems: 'flex-end',
        },
        username: {
            fontFamily: 'Font-600',
        },
        address: {
            fontFamily: 'Font-500',
        },
        rowValue: {
            fontFamily: 'Font-500',
        },
        feeEstimate: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-500',
            fontSize: 12,
        },
        thumbnail: {
            width: 36,
            height: 36,
            borderRadius: rounded.full,
            marginLeft: spacing.m,
        },
        actionButtons: {
            flexDirection: 'row',
            gap: spacing.s,
            paddingVertical: spacing.m,
        },
        actionButton: {
            flex: 1,
        },
    });
