import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import Image from '@/components/Image/Image';
import {hideMiddle} from '@/utils/helper/formatter';
import Tag from '@/components/Tag/Tag';
import {AntDesign} from '@expo/vector-icons';
import {WalletAsset} from '@/utils/api/walletAssets';
import BigNumber from 'bignumber.js';
import {useNavigation} from '@react-navigation/native';
import {getAccountStore} from '@/storage/accountStore';
import {ModalBackdrop} from '@/components/ModalBackdrop/ModalBackdrop';

const TokenDetailModal = ({address, symbol, name, logo, total, price, ui_amount, chain}: WalletAsset, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const navigation = useNavigation();

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.8} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = useCallback(() => {
        ref.current?.close();
    }, []);

    const onSend = () => {
        onClose();
        navigation.navigate('SendCryptoModal', {fromChain: chain, fromTokenAddress: address});
    };

    const onReceive = () => {
        onClose();
        const store = getAccountStore();
        const accountID = store.currentAccountID();
        const fromAddress = store.getAddressForAccountIDChain(accountID, chain);
        if (!fromAddress) return;
        navigation.navigate('MyAddressQrCode', {chain, address: fromAddress});
    };

    const onSwap = () => {
        onClose();
        navigation.navigate('Swap', {fromChain: chain, fromTokenAddress: address});
    };

    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={ModalBackdrop}
            keyboardBehavior="interactive">
            <BottomSheetView style={styles.bottomSheetView}>
                <ModalHead title="" onClose={onClose} />
                <View style={styles.scrollView}>
                    <View style={styles.topWrapper}>
                        <Image uri={logo} style={styles.thumbnail} />
                        <View>
                            <Text style={styles.symbol} weight={'600'}>
                                {symbol}
                            </Text>
                            <Text style={styles.name}>{name}</Text>
                        </View>
                        <View style={styles.amountWrap}>
                            <Text style={styles.amount} weight={'600'}>
                                {ui_amount}
                            </Text>
                            <Text style={styles.usdValue}>${new BigNumber(total).toFormat(2)}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.row}>
                            <Text style={styles.rowKey}>Chain</Text>
                            <Text style={[styles.rowValue, {textTransform: 'capitalize'}]}>{chain}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowKey}>Address</Text>
                            <Text style={styles.rowValue}>{hideMiddle(address, 4)}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.rowKey}>Price</Text>
                            <Text style={styles.rowValue}>${price}</Text>
                        </View>
                    </View>
                    <View style={styles.actions}>
                        <Tag
                            title={'Send'}
                            textStyle={styles.actionText}
                            onPress={onSend}
                            icon={<AntDesign name={'arrowup'} style={styles.actionIcon} />}
                            containerStyle={[styles.actionTag]}
                        />
                        <Tag
                            title={'Receive'}
                            textStyle={styles.actionText}
                            onPress={onReceive}
                            icon={<AntDesign name={'arrowdown'} style={styles.actionIcon} />}
                            containerStyle={styles.actionTag}
                        />
                        <Tag
                            title={'Swap'}
                            textStyle={styles.actionText}
                            onPress={onSwap}
                            icon={<AntDesign name={'swap'} style={styles.actionIcon} />}
                            containerStyle={styles.actionTag}
                        />
                    </View>
                    {/*<Button title={'Send'} onPress={onSend} containerStyle={styles.payButton} />*/}
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.modalBackground,
        },
        bottomSheetView: {
            paddingBottom: spacing.xl,
        },
        scrollView: {
            marginHorizontal: spacing.th,
            marginTop: spacing.l,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        topWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        thumbnail: {
            borderRadius: rounded.full,
            marginRight: spacing.m,
            height: 48,
            width: 48,
        },
        name: {
            color: theme.colors.textSecondary,
        },
        symbol: {
            fontSize: 16,
        },
        section: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.xl,
            marginTop: spacing.l,
            padding: spacing.s,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: spacing.m,
        },
        rowKey: {
            color: theme.colors.textSecondary,
        },
        rowValue: {
            color: theme.colors.textPrimary,
        },
        amountWrap: {
            alignItems: 'flex-end',
            flex: 1,
        },
        amount: {
            fontSize: 26,
        },
        actions: {
            flexDirection: 'row',
            marginTop: spacing.l,
            gap: spacing.s,
        },
        actionIcon: {
            color: theme.colors.textPrimary,
            fontSize: 16,
        },
        actionTag: {
            justifyContent: 'space-between',
            borderRadius: rounded.xl,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            flex: 1,
        },
        actionText: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-600',
            fontSize: 14,
        },
        usdValue: {
            color: theme.colors.textSecondary,
        },
    });

export default React.forwardRef(TokenDetailModal);
