import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AllStackScreenProps, SendCryptoRecipient} from '@/navigation/types';
import {rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import TextInput from '@/components/TextInput/TextInput';
import {Feather, FontAwesome5, MaterialCommunityIcons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import ScanQRCodeModal from '@/components/ScanQRCodeModal/ScanQRCodeModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import Separator from '@/components/Separator/Separator';
import {PasteAddress} from '@/screens/SendCrypto/components/PasteAddress';
import Button from '@/components/Button/Button';
import {getChainOperations} from '@/chains/chainOperations';
import {RecipientRecent} from '@/screens/SendCrypto/components/RecipientRecent';
import {RecipientMyAddresses} from '@/screens/SendCrypto/components/RecipientMyAddresses';
import {SearchUsernameResponse} from '@/utils/api/userSearch';
import {ToastController} from '@/components/Toast/Toast';
import crypto from 'react-native-quick-crypto';
import {useAtom, useAtomValue} from 'jotai';
import {searchUsernameAtom} from '@/screens/SearchUsername/SearchUsername';

const SendCryptoAddress = ({navigation, route}: AllStackScreenProps<'SendCryptoAddress'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {fromChain, fromAddress} = route.params;
    const [toAddress, setToAddress] = useState<string>('');
    const scanQRCodeModal = useRef<BottomSheetModal>(null);
    const onScanQRCode = () => {
        navigation.navigate('ScanQR');
    };
    const [searchUsernameRes, setSearchUsernameRes] = useAtom(searchUsernameAtom);
    const thisSessionId = useRef<string>(Buffer.from(crypto.randomBytes(16)).toString('hex'));
    useEffect(() => {
        const res = searchUsernameRes[thisSessionId.current];
        if (res) {
            onUserSearchSelected(res);
            //remove it from atom
            setSearchUsernameRes(curr => {
                const copy = {...curr};
                delete copy[thisSessionId.current];
                return copy;
            });
        }
    }, [searchUsernameRes]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Enter Recipient',
            headerRight: () => (
                <Pressable onPress={onScanQRCode}>
                    <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.colors.textPrimary} />
                </Pressable>
            ),
        });
    }, [navigation.setOptions, theme.colors.textPrimary]);

    const onRecipient = (r: SendCryptoRecipient) => {
        r.chain = fromChain;
        Keyboard.dismiss();
        navigation.navigate('SendCryptoConfirm', {
            ...route.params,
            toAddress: r.address,
            toUser: r,
        });
    };

    const isValidAddress = useMemo(() => {
        const ops = getChainOperations(fromChain);
        return ops && ops.verifyAddress(toAddress);
    }, [fromChain, toAddress]);

    const onContinue = () => {
        if (!isValidAddress) {
            return;
        }
        navigation.navigate('SendCryptoConfirm', {
            ...route.params,
            toAddress,
            toUser: {
                address: toAddress,
                chain: fromChain,
            },
        });
    };

    const onUserSearchSelected = (user: SearchUsernameResponse) => {
        console.log('onUserSearchSelected');
        for (const acc of user.accounts) {
            console.log(acc.chain, fromChain);
            if (acc.chain === fromChain) {
                console.log('found address', acc.address);
                setToAddress(acc.address);
                navigation.navigate('SendCryptoConfirm', {
                    ...route.params,
                    toAddress: acc.address,
                    toUser: {
                        address: acc.address,
                        chain: fromChain,
                        thumbnail: user.thumbnail?.uri,
                        username: user.username,
                    },
                });
                return;
            }
        }
        ToastController.show({
            kind: 'error',
            content: `Couldn't find ${fromChain} address for ${user.username}`,
        });
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
                <TextInput
                    textStyle={styles.inputText}
                    placeholder={'Recipient Address'}
                    clearButtonMode={'always'}
                    value={toAddress}
                    onChangeText={setToAddress}
                    returnKeyType={'done'}
                />
                <PasteAddress onAddress={setToAddress} chain={fromChain} />
                <Separator space={spacing.l} />
                <RecipientRecent onRecipient={onRecipient} chain={fromChain} filterAddress={fromAddress} />
                <Separator space={spacing.l} />
                <RecipientMyAddresses onRecipient={onRecipient} chain={fromChain} filterAddress={fromAddress} />

                <Separator space={spacing.l} />
                <ScrollView horizontal={true} style={styles.actionWrap} contentContainerStyle={styles.actions}>
                    <Pressable
                        style={styles.actionButtonWrap}
                        onPress={() => {
                            navigation.navigate('SearchRafiki');
                        }}>
                        <FontAwesome5 name="user-friends" style={styles.actionButtonIcon} />
                        <Text style={styles.actionButtonText}>Search rafiki</Text>
                    </Pressable>
                    <Pressable
                        style={styles.actionButtonWrap}
                        onPress={() => {
                            navigation.navigate('SearchUsername', {searchId: thisSessionId.current});
                        }}>
                        <Feather name="search" style={styles.actionButtonIcon} />
                        <Text style={styles.actionButtonText}>Shogun user</Text>
                    </Pressable>
                </ScrollView>
            </ScrollView>
            <Button
                title={'Continue'}
                disabled={!isValidAddress}
                onPress={onContinue}
                containerStyle={styles.continueButton}
            />
            <ScanQRCodeModal ref={scanQRCodeModal} mode={'scan'} />
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        container: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: spacing.th,
            paddingVertical: spacing.l,
        },
        label: {
            padding: spacing.xs,
        },

        inputText: {
            fontFamily: 'Font-500',
            fontSize: 18,
        },
        tabs: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.l,
            gap: spacing.l,
        },
        tab: {
            borderRadius: rounded.xl,
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
        },
        tabText: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-500',
        },
        tabSelected: {
            backgroundColor: theme.colors.primary,
        },
        tabTextSelected: {
            color: theme.isDark ? theme.colors.black : theme.colors.white,
        },
        continueButton: {
            marginHorizontal: spacing.th,
            paddingVertical: spacing.l,
        },
        actionWrap: {
            marginHorizontal: -spacing.th,
            paddingHorizontal: spacing.th,
        },
        actions: {
            gap: spacing.l,
        },
        actionButtonWrap: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.xl,
            justifyContent: 'center',
            padding: spacing.m,
            width: 130,
            height: 100,
            gap: spacing.s,
        },
        actionButtonIcon: {
            fontSize: 24,
            color: theme.colors.textPrimary,
        },
        actionButtonText: {
            color: theme.colors.textSecondary,
        },
    });

export default SendCryptoAddress;
