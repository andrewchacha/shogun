import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import TextInput from '@/components/TextInput/TextInput';
import {ToastController} from '@/components/Toast/Toast';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import aes256 from '@/utils/aes256/aes256';
import {rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {type TextInput as NativeText, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {useModalBackground} from '@/hooks/utility/useModalBackground';

const EncryptPassphrase = ({navigation, route}: RootStackScreenProps<'EncryptPassphrase'>) => {
    const {passphrase} = route.params;

    const passRef = React.useRef<NativeText>(null);
    const confirmPassRef = React.useRef<NativeText>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [encrypted, setEncrypted] = useState('');

    useModalBackground();
    const onEncrypt = async () => {
        if (password.length < 8) {
            ToastController.show({kind: 'error', content: 'Password must be at least 8 characters'});
            return;
        }
        if (password !== confirmPassword) {
            ToastController.show({kind: 'error', content: 'Passwords do not match'});
            return;
        }

        try {
            const encrypted = aes256.encryptText(passphrase, password);
            const decrypted = aes256.decryptText(encrypted, password);

            if (decrypted !== passphrase) {
                ToastController.show({kind: 'error', content: 'Encryption failed'});
                return;
            }

            setEncrypted(encrypted);
        } catch (error) {
            console.warn(error);
        }
    };
    const onNext = () => {
        confirmPassRef.current?.focus();
    };

    useLayoutEffect(() => {
        navigation.setOptions({title: 'Encrypt Passphrase'});
    }, [navigation]);

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    if (encrypted.length > 0) {
        return (
            <SafeAreaView style={styles.safeAreaView}>
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <Text weight={'600'}>Your Encrypted Text</Text>
                    <View style={styles.passWrap}>
                        <Text style={styles.passphrase} selectable={true}>
                            {encrypted}
                        </Text>
                    </View>
                    <Text style={styles.info}>
                        Copy and Save this text somewhere safe. Do not forget the password, we can't decrypt the text
                        without it.
                    </Text>

                    <Separator space={spacing.l} />
                    <Button title={'Done'} onPress={() => navigation.goBack()} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text weight={'600'}>Your Passphrase</Text>
                <View style={styles.passWrap}>
                    <Text style={styles.passphrase}>{passphrase}</Text>
                </View>

                <Text style={styles.info}>
                    Enter a strong password get encrypted text, the encrypted text can be decrypted later using the
                    password. Do not forget the password, we can't decrypt the text without it.
                </Text>

                <Separator space={spacing.l} />
                <Text style={styles.label}>Password</Text>
                <TextInput
                    value={password}
                    secureTextEntry={true}
                    onSubmitEditing={() => onNext()}
                    ref={passRef}
                    returnKeyType={'next'}
                    placeholder={'Enter Password'}
                    onChangeText={setPassword}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    value={confirmPassword}
                    secureTextEntry={true}
                    ref={confirmPassRef}
                    returnKeyType={'done'}
                    placeholder={'Confirm Password'}
                    onChangeText={setConfirmPassword}
                />

                <Separator space={spacing.l} />
                <Button title={'Encrypt'} onPress={onEncrypt} />
            </ScrollView>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: spacing.th,
        },
        passWrap: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
            marginTop: spacing.m,
            padding: spacing.l,
        },
        passphrase: {
            fontFamily: 'Font-500',
        },
        label: {
            marginTop: spacing.m,
            fontSize: 14,
        },
        info: {
            marginTop: spacing.m,
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
    });

export default EncryptPassphrase;
