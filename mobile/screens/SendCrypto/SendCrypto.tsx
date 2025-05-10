import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {CommonStackScreenProps, SendCryptoAddressParams} from '@/navigation/types';
import {palette, rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, View, Text as NativeText} from 'react-native';
import {useModalBackground} from '@/hooks/utility/useModalBackground';
import Button from '@/components/Button/Button';
import {NumberKeyboard} from '@/screens/SendCrypto/components/NumberKeyboard';
import Tag from '@/components/Tag/Tag';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';
import BigNumber from 'bignumber.js';
import {useKeyboardHandler} from '@/screens/SendCrypto/useKeyboardHandler';
import {useTokenInfo} from '@/hooks/api/useTokenInfo';
import {useWalletAssets} from '@/hooks/wallets/useWalletAssets';
import {formatAmount} from '@/utils/helper/numberFormatter';
import {capitalizeFirstLetter} from '@/utils/helper/formatter';
import Image from '@/components/Image/Image';
import {useTokenPrice} from '@/hooks/api/useTokenPrice';
import * as Haptics from 'expo-haptics';
import {getAccountStore} from '@/storage/accountStore';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';

const SendCrypto = ({navigation, route}: CommonStackScreenProps<'SendCrypto'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {fromChain, fromTokenAddress} = route.params;

    const currAcc = useCurrentAccountID();
    const fromAccountAddress = useMemo(() => {
        if (!currAcc) return '';
        return getAccountStore().getAddressForAccountIDChain(currAcc, fromChain) || '';
    }, [fromChain, currAcc]);

    const {data: tokenData} = useTokenInfo(fromTokenAddress, fromChain, true);
    const {data: walletData} = useWalletAssets(fromAccountAddress, fromChain);
    const {data: tokenUSDPrice} = useTokenPrice(fromTokenAddress);
    const [amount, setAmount] = useState('0');

    const tokenUsdValue = useMemo(() => {
        if (!tokenUSDPrice || !amount) return new BigNumber(0);
        return new BigNumber(tokenUSDPrice.data?.price || 0).times(amount || 0);
    }, [tokenUSDPrice, amount]);

    const myBalance = useMemo(() => {
        if (!walletData?.data) return new BigNumber(0);
        if (fromTokenAddress === walletData.data.native.address) {
            //TODO get fee and minus it here first before showing it, that way user
            //can see the exact amount they can send
            return new BigNumber(walletData.data.native.ui_amount || 0);
        }
        const t = walletData.data.tokens.find(t => t.address === fromTokenAddress);
        return new BigNumber(t?.ui_amount || 0);
    }, [walletData?.data]);

    useModalBackground();
    useLayoutEffect(() => {
        navigation.setOptions({title: 'Send Crypto'});
    }, [navigation.setOptions]);

    const {onKeyboardNumberPress, onDecimalSeparator, onBackspace} = useKeyboardHandler({
        tokenBalance: myBalance,
        tokenDecimals: tokenData?.data?.decimals || 9,
        amount,
        setAmount,
    });

    const onMax = () => {
        setAmount(myBalance.toString());
    };

    const isAmountLargerThanBalance = new BigNumber(amount || 0).isGreaterThan(myBalance);
    const amountFontSize = amount.length > 8 ? 32 : 50;

    const onContinue = () => {
        if (!tokenData?.data) return;
        if (isAmountLargerThanBalance) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (!fromChain || !tokenData.data || !fromTokenAddress) {
            return;
        }
        const amt = new BigNumber(amount);
        if (amt.isNaN() || amt.isZero()) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        const params: SendCryptoAddressParams = {
            fromChain: fromChain,
            fromTokenAddress: fromTokenAddress,
            fromToken: tokenData.data,
            fromTokenPrice: tokenUSDPrice?.data?.price,
            fromAddress: fromAccountAddress,
            uiAmount: amount,
        };
        navigation.navigate('SendCryptoAddress', params);
    };
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                <View style={styles.chainInfo}>
                    <Tag
                        title={`Network: ${capitalizeFirstLetter(fromChain)}`}
                        icon={<ChainLogo chain={fromChain} />}
                        containerStyle={styles.tagWrap}
                    />
                    <Tag
                        title={`Token: ${tokenData?.data?.symbol}`}
                        containerStyle={styles.tagWrap}
                        icon={<Image uri={tokenData?.data?.logo} preset={'sm'} style={styles.tokenLogo} />}
                    />
                </View>
                <View style={styles.upperWrap}>
                    <View style={styles.amountWrap}>
                        <Text
                            style={[
                                styles.amount,
                                {fontSize: amountFontSize},
                                isAmountLargerThanBalance && styles.amountLargerThanBalance,
                            ]}>
                            {amount} <NativeText style={styles.symbol}>{tokenData?.data?.symbol}</NativeText>
                        </Text>
                    </View>
                    <Text style={styles.equivalent}>~{formatAmount(tokenUsdValue)} USD</Text>
                </View>
                <View style={styles.availableWrap}>
                    <Text style={[styles.availableText, isAmountLargerThanBalance && styles.amountLargerThanBalance]}>
                        {formatAmount(myBalance)} {tokenData?.data?.symbol} available to send
                    </Text>
                    <Tag onPress={onMax} title={'MAX'} containerStyle={styles.maxWrap} />
                </View>
                <NumberKeyboard
                    onNumber={onKeyboardNumberPress}
                    onDecimalSeparator={onDecimalSeparator}
                    onBackspace={onBackspace}
                    containerStyle={styles.keyboardWrap}
                />
            </View>
            <Button title={'Continue'} containerStyle={styles.continueButton} onPress={onContinue} />
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        container: {
            marginHorizontal: spacing.th,
            flex: 1,
        },
        amountWrap: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        amount: {
            fontFamily: 'Font-700',
            color: theme.isDark ? palette.white : palette.black,
        },
        amountLargerThanBalance: {
            color: theme.colors.warning,
        },
        symbol: {
            marginLeft: spacing.xs,
            color: theme.colors.textTertiary,
        },
        equivalent: {
            fontFamily: 'Font-500',
            color: theme.colors.textSecondary,
        },
        continueButton: {
            marginHorizontal: spacing.th,
            marginBottom: spacing.th,
            marginTop: spacing.m,
        },
        upperWrap: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        keyboardWrap: {
            flex: 1,
            justifyContent: 'flex-end',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.border,
            marginTop: spacing.m,
            marginHorizontal: -spacing.th,
            paddingHorizontal: spacing.th,
        },
        chainInfo: {
            flexDirection: 'row',
            marginBottom: spacing.s,
            gap: spacing.s,
            justifyContent: 'center',
        },
        tagWrap: {
            borderRadius: rounded.full,
            paddingHorizontal: spacing.m,
        },
        tokenLogo: {
            width: 20,
            height: 20,
            borderRadius: 10,
        },
        availableWrap: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        availableText: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-500',
            flex: 1,
        },
        maxWrap: {
            ...theme.cardVariants.tagMute,
            borderRadius: rounded.full,
            paddingHorizontal: spacing.l,
        },
        maxText: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-600',
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            fontSize: 12,
        },
    });

export default SendCrypto;
