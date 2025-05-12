import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useRef, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {spacing} from '@/utils/styles';
import TextInput from '@/components/TextInput/TextInput';
import Separator from '@/components/Separator/Separator';
import Button from '@/components/Button/Button';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import WalletNotFoundDialog from '@/screens/WalletImport/ImportingDialog';
import aes256 from '@/utils/aes256/aes256';
import {ToastController} from '@/components/Toast/Toast';
import {validateMnemonic} from '@/utils/helper/mnemonic';
import {apiAuthExists} from '@/utils/api/authExists';
import {apiLogin, getApiLoginParamsWithSigner} from '@/utils/api/authLogin';
import {CommonActions} from '@react-navigation/native';
import {AccessToken} from '@/storage/token';
import {getChainOperations} from '@/chains/chainOperations';
import {Chain} from '@/chains/chain';
import {getApiAuthParamsWithSigner} from '@/hooks/api/useAuthAccountExists';
import {getAccountStore} from '@/storage/accountStore';

const WalletImport = ({navigation}: RootStackScreenProps<'WalletImport'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const walletNotFoundDialog = useRef<BottomSheetModal>(null);
    const [mnemonic, setMnemonic] = useState('');
    const [password, setPassword] = useState('');
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onImport = () => {
        const isValid = validateMnemonic(mnemonic);
        if (!isValid) {
            if (password.length > 0) {
                tryDecrypt();
                return;
            }
            ToastController.show({
                content: 'Invalid recovery phrase. Please check and try again.',
                kind: 'error',
            });
            return;
        }
        void onImportMnemonic(mnemonic);
    };

    const onTextChange = (text: string) => {
        const split = text.trim().split(' ');
        if (text.length > 30 && split.length === 1) {
            setIsEncrypted(true);
        } else {
            setIsEncrypted(false);
        }
        setMnemonic(text);
    };

    const tryDecrypt = () => {
        try {
            const decrypted = aes256.decryptText(mnemonic, password);
            if (validateMnemonic(decrypted)) {
                void onImportMnemonic(decrypted);
                return;
            }
            ToastController.show({
                content: 'Decryption worked but the recovery phrase is invalid.',
                kind: 'error',
            });
        } catch (error) {
            ToastController.show({
                content: 'Failed to decrypt the text. Please check your password and try again.',
                kind: 'error',
            });
        }
    };

    const onImportMnemonic = async (mnemonic: string) => {
        setIsLoading(true);
        try {
            const ops = getChainOperations(Chain.Solana);
            const solanaKey = await ops.generateKeyFromMnemonic(mnemonic, 0);
            const authParams = await getApiAuthParamsWithSigner(solanaKey);
            const res = await apiAuthExists(authParams);
            setIsLoading(false);
            if (!res.data) {
                return;
            }
            if (res.data.exists) {
                void onConfirm();
                return;
            }
            walletNotFoundDialog?.current?.present();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirm = async () => {
        walletNotFoundDialog?.current?.close();
        try {
            setIsLoading(true);
            const ops = getChainOperations(Chain.Solana);
            const solanaKey = await ops.generateKeyFromMnemonic(mnemonic, 0);
            const params = await getApiLoginParamsWithSigner(solanaKey);
            const res = await apiLogin(params);
            setIsLoading(false);
            if (res.data?.access_token) {
                AccessToken.store(solanaKey.address, res.data.access_token, res.data.expires_in);
                await getAccountStore().createNewWallet(mnemonic);
                navigation.dispatch(CommonActions.reset({index: 1, routes: [{name: 'Main'}]}));
                return;
            }
            ToastController.show({
                content: 'Failed to login. Please try again.',
                kind: 'error',
            });
        } catch (error) {
            console.log(error);
            ToastController.show({
                content: `Failed to login. Please try again. ${JSON.stringify(error)}`,
                kind: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant={'header'}>Import Wallet</Text>
                <Separator space={spacing.l} />
                <Text style={styles.explainer}>Enter your recovery phrase in plain text or encrypted text.</Text>
                <Separator space={spacing.s} />
                <TextInput
                    multiline={true}
                    placeholder={'Paste or write your recovery phrase here'}
                    textStyle={styles.input}
                    value={mnemonic}
                    onChangeText={onTextChange}
                    returnKeyType={'done'}
                />
                {isEncrypted && (
                    <>
                        <Separator space={spacing.l} />
                        <Text weight={'500'}>Password</Text>
                        <Text style={styles.explainer}>
                            Enter password to decrypt the text if you are importing from encrypted text otherwise leave
                            it blank
                        </Text>
                        <Separator space={spacing.xs} />
                        <TextInput
                            placeholder={'Password'}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </>
                )}
                <Separator space={spacing.xl} />
                <Button isLoading={isLoading} title={'Import'} onPress={onImport} />
            </ScrollView>
            <WalletNotFoundDialog ref={walletNotFoundDialog} onConfirm={onConfirm} />
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
            paddingVertical: spacing.th,
        },
        input: {
            minHeight: 64,
        },
        lockIcon: {
            color: theme.colors.textSecondary,
            fontSize: 18,
        },
        explainer: {
            color: theme.colors.textSecondary,
        },
    });

export default WalletImport;
