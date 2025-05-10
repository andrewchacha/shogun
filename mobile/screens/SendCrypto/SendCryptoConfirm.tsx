import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import {rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {Linking, SafeAreaView, StyleSheet, View} from 'react-native';
import {SendStateConfirm} from '@/screens/SendCrypto/components/SendStateConfirm';
import {SendState, SendStateSending} from '@/screens/SendCrypto/components/SendStateSending';
import {Success} from '@/components/Animations/Success';
import Text from '@/components/Text/Text';
import {hideMiddle} from '@/utils/helper/formatter';
import Button from '@/components/Button/Button';
import {getChainOperations} from '@/chains/chainOperations';
import {getAccountStore} from '@/storage/accountStore';
import {ToastController} from '@/components/Toast/Toast';
import Pressable from '@/components/Button/Pressable';
import {AntDesign} from '@expo/vector-icons';
import {err} from 'react-native-svg';
import BigNumber from 'bignumber.js';
import {formatAmount} from '@/utils/helper/numberFormatter';
import {useWalletAssets} from '@/hooks/wallets/useWalletAssets';
import {getRecentStore} from '@/storage/recentStore';
import {FeeEstimate} from '@/chains/chainInterface';
import {MoneyTransferAnimation} from '@/screens/SendCrypto/components/MoneyTransferAnimation';
import {invalidateWalletHistory} from '@/hooks/wallets/useWalletHistory';

type screen = 'confirm' | 'sending' | 'success' | 'error';

//TODO get correct network fee
const SendCryptoConfirm = ({navigation, route}: CommonStackScreenProps<'SendCryptoConfirm'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {fromAddress, uiAmount, fromTokenPrice, toAddress, fromChain, fromToken} = route.params;
    const {refetch} = useWalletAssets(fromAddress, fromChain);

    const [screen, setScreen] = useState<screen>('confirm');
    const [sendState, setSendState] = useState<SendState>(SendState.broadcast);
    const [signature, setSignature] = useState('');
    const [error, setError] = useState<string | null>(null);

    useLayoutEffect(() => {
        navigation.setOptions({title: 'Send'});
    }, [navigation.setOptions]);

    const isSending = useRef(false);

    async function onConfirm(fee?: FeeEstimate) {
        if (isSending.current) return;
        isSending.current = true;
        try {
            setScreen('sending');
            setSendState(SendState.broadcast);

            const store = getAccountStore();
            const ops = getChainOperations(fromChain);
            const fromKey = store.getChainKeyForAddress(fromAddress);
            if (!fromKey) {
                ToastController.show({content: 'Error: No key found for address', kind: 'error'});
                return;
            }
            const signature = await ops.transfer(fromKey, toAddress, uiAmount, fromToken, fee);
            setSignature(signature);
            setSendState(SendState.confirming);
            invalidateWalletHistory(fromAddress, fromChain);
            const confirmTransaction = await ops.confirmTransaction(signature);
            if (confirmTransaction) {
                setScreen('success');
                setSendState(SendState.success);
            } else {
                setScreen('error');
            }
            const recentStore = getRecentStore();
            recentStore.addRecent({
                address: toAddress,
                chain: fromChain,
                date: Date.now(),
                from_address: fromAddress,
            });
            void refetch();
        } catch (error) {
            setScreen('error');
            setError(JSON.stringify(error));
        } finally {
            isSending.current = false;
        }
    }

    function openExplorer() {
        const ops = getChainOperations(fromChain);
        const url = ops.getExplorerUrlForTx(signature);
        //TODO use expo web browser
        void Linking.openURL(url);
    }

    function onCancel() {
        navigation.popToTop();
        navigation.pop(1);
    }

    const usdValue = new BigNumber(fromTokenPrice || 0).times(uiAmount);
    if (!fromToken) return null;
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                {screen === 'confirm' && (
                    <SendStateConfirm {...route.params} onConfirm={onConfirm} onCancel={onCancel} />
                )}

                {screen === 'sending' && <SendStateSending sendState={sendState} {...route.params} />}

                {screen === 'success' && (
                    <View style={styles.containerSuccess}>
                        <View style={styles.successInner}>
                            <Success bgColor={theme.colors.secondary} size={150} />
                            <Text style={styles.successInfo}>Transaction sent successfully!</Text>
                            <Text style={styles.amount}>
                                {uiAmount} {fromToken.symbol}
                            </Text>
                            <Text style={styles.estimate}>~{formatAmount(usdValue)} USD</Text>
                            <Pressable onPress={openExplorer}>
                                <Text style={styles.signature}>{hideMiddle(signature, 6)}</Text>
                            </Pressable>
                        </View>
                        <Button title={'Done'} onPress={onCancel} containerStyle={styles.doneButton} />
                    </View>
                )}
                {screen === 'error' && (
                    <View style={styles.containerError}>
                        <View style={styles.successInner}>
                            <View style={styles.failedWrap}>
                                <AntDesign name="warning" size={46} color={theme.colors.warning} />
                            </View>
                            <Text style={styles.failedTitle}>Transaction failed!</Text>
                            <Text style={styles.failedInfo}>
                                There was an error sending, please check your transaction history to make sure before
                                you try again.
                            </Text>
                            {error && <Text style={styles.failedError}>{error}</Text>}
                            {signature && (
                                <Pressable onPress={openExplorer}>
                                    <Text style={styles.signature}>Tx: {hideMiddle(signature, 6)}</Text>
                                </Pressable>
                            )}
                        </View>
                        <Button title={'Done'} onPress={onCancel} containerStyle={styles.doneButton} />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
            overflow: 'hidden',
        },
        container: {
            marginHorizontal: spacing.th,
            flex: 1,
        },
        containerSuccess: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: spacing.xl,
        },
        successInfo: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-500',
            fontSize: 16,
        },
        amount: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-700',
            fontSize: 30,
        },
        estimate: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-500',
            fontSize: 16,
        },
        signature: {
            fontFamily: 'Font-400',
            color: theme.colors.secondary,
            textDecorationLine: 'underline',
            marginTop: spacing.l,
        },
        successInner: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
        },
        doneButton: {
            width: '100%',
            padding: spacing.l,
        },
        containerError: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: spacing.xl,
        },
        failedWrap: {
            backgroundColor: theme.colors.warning + '20',
            borderRadius: rounded.full,
            marginBottom: spacing.l,
            padding: spacing.xl,
        },
        failedTitle: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-700',
            fontSize: 20,
        },
        failedInfo: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-500',
            textAlign: 'center',
            fontSize: 16,
        },
        failedError: {
            color: theme.colors.warning,
            fontFamily: 'Font-500',
            marginTop: spacing.l,
            textAlign: 'center',
            fontSize: 16,
        },
    });

export default SendCryptoConfirm;
