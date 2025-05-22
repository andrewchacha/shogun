import Button from '@/components/Button/Button';
import Pressable from '@/components/Button/Pressable';
import Loading from '@/components/Loading/Loading';
import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import {ToastController} from '@/components/Toast/Toast';
import {Wordlists, generateMnemonic} from '@/utils/bip39/bip39';
import {AntDesign, Feather, MaterialIcons} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import * as Clipboard from 'expo-clipboard';
import React, {forwardRef, useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Tag from '@/components/Tag/Tag';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {atom, useAtomValue, useAtom} from 'jotai';
import ModalHead from '@/components/ModalHead/ModalHead';
import {apiLogin, getApiLoginSignMessage} from '@/utils/api/authLogin';
import {AccessToken} from '@/storage/token';
import {getAccountStore} from '@/storage/accountStore';
import {ChainOperations} from '@/chains/chainOperations';

type Strength = 128 | 256;
const strengthAtom = atom<Strength>(256);

export const GenerateWallet = React.memo(() => {
    const navigation = useNavigation();

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [mnemonic, setMnemonic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const strength = useAtomValue<Strength>(strengthAtom);

    const [isDoneLoading, setIsDoneLoading] = useState(false);

    useLayoutEffect(() => {
        getMnemonic();
    }, [strength]);

    const getMnemonic = () => {
        setIsGenerating(true);
        setTimeout(() => {
            void makeNewMnemonic();
        }, 1000);
    };

    const strengthModalRef = React.useRef<BottomSheetModal>(null);
    const onStrength = useCallback(() => {
        strengthModalRef.current?.present();
    }, []);

    const makeNewMnemonic = async () => {
        try {
            const mnemonic = generateMnemonic(strength, Wordlists.en);
            setMnemonic(mnemonic);
        } catch (e) {
            console.log(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const onDone = async () => {
        try {
            const ops = ChainOperations.solana;
            const solanaKey = await ops.generateKeyFromMnemonic(mnemonic, 0);
            const timestamp = `${Date.now()}`;
            const loginParams = {
                solanaAddress: solanaKey.address,
                timestamp: timestamp,
                signature: await ops.signShogunMessage(solanaKey, getApiLoginSignMessage(solanaKey.address, timestamp)),
            };
            const res = await apiLogin(loginParams);
            setIsDoneLoading(true);
            if (res && res.data?.access_token) {
                AccessToken.store(solanaKey.address, res.data.access_token, res.data.expires_in);
                await getAccountStore().createNewWallet(mnemonic);
                navigation.dispatch(CommonActions.reset({index: 1, routes: [{name: 'Main'}]}));
                return;
            }
            ToastController.show({kind: 'error', content: 'Failed to login. Please try again.'});
        } catch (error) {
            ToastController.show({kind: 'error', content: `Failed to login. Please try again. ${error}`});
        } finally {
            setIsDoneLoading(false);
        }
    };

    const onEncrypt = () => {
        if (!mnemonic) return;
        navigation.navigate('EncryptPassphrase', {passphrase: mnemonic});
    };

    const onCopy = () => {
        void Clipboard.setStringAsync(mnemonic);
        ToastController.show({kind: 'info', content: 'Copied to clipboard'});
    };

    return (
        <View style={styles.container}>
            <Text variant={'header'} style={styles.head}>
                Your Passphrase
            </Text>
            <Text style={styles.warning}>Do not share with anyone</Text>
            <View style={styles.mnemonicWrap}>
                {isGenerating ? (
                    <>
                        <Loading isLoading={true} />
                        <Text>Generating...</Text>
                    </>
                ) : (
                    <Text style={styles.mnemonic} weight={'600'}>
                        {mnemonic}
                    </Text>
                )}
            </View>
            <Separator space={spacing.l} />
            <View style={styles.actions}>
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={onStrength}
                    icon={<AntDesign name="switcher" style={styles.tagIcon} />}
                    title="Strength"
                />
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={onEncrypt}
                    title={'Encrypt'}
                    icon={<MaterialIcons name="enhanced-encryption" style={styles.tagIcon} />}
                />
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={getMnemonic}
                    icon={<Feather name="repeat" style={styles.tagIcon} />}
                    title="Regenerate"
                />
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={onCopy}
                    title={'Copy'}
                    icon={<AntDesign name="copy1" style={styles.tagIcon} />}
                />
            </View>
            <Separator space={spacing.l} />
            <Button
                isLoading={isDoneLoading}
                title={'Done'}
                onPress={onDone}
                disabled={!mnemonic || isGenerating}
                containerStyle={styles.button}
            />
            <StrengthModal ref={strengthModalRef} />
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.th,
            marginTop: spacing.l,
            flex: 1,
        },
        head: {
            textAlign: 'center',
        },
        warning: {
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        mnemonicWrap: {
            ...theme.cardVariants.simple,
            backgroundColor: `${theme.colors.cardBackground}BB`,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.xl,
            marginTop: spacing.xl,
            borderRadius: rounded.l,
            gap: spacing.m,
        },
        mnemonic: {
            fontSize: 20,
            fontFamily: 'Font-500',
        },
        button: {},
        actions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.m,
            // justifyContent: 'space-between',
        },
        tagWrap: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.m,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.s,
            gap: spacing.s,
            minWidth: 120,
            justifyContent: 'space-between',
        },
        tagIcon: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
    });

type Props = {};

const STRENGTHS: {title: string; value: Strength; description: string}[] = [
    {title: '128 bits', value: 128, description: `12 words passphrase, secure enough, recommended for most users`},
    {title: '256 bits', value: 256, description: `24 words passphrase, the most secure recommended for advanced users`},
];

const StrengthModal = forwardRef((props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const [strength, setStrength] = useAtom(strengthAtom);

    const snapPoints = useMemo(() => [350, 400], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, strengthStyles);

    const onStrength = (value: Strength) => {
        setStrength(value);
        ref.current.dismiss();
    };

    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}>
            <ModalHead
                title={'Strength'}
                onClose={() => {
                    ref.current.dismiss();
                }}
            />
            <View style={styles.scrollView}>
                {STRENGTHS.map((s, i) => (
                    <Pressable
                        key={i}
                        onPress={() => {
                            onStrength(s.value);
                        }}
                        style={[styles.card, strength === s.value && styles.cardSelected]}>
                        <View style={styles.cardInner}>
                            <Text variant={'header'} style={styles.title}>
                                {s.title}
                            </Text>
                            <Text style={styles.description}>{s.description}</Text>
                        </View>
                        {strength === s.value && <Feather name="check" style={styles.checkmark} />}
                    </Pressable>
                ))}
            </View>
        </BottomSheetModal>
    );
});

const strengthStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.modalBackground,
        },
        scrollView: {
            marginHorizontal: spacing.th,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        card: {
            ...theme.cardVariants.simple,
            padding: spacing.l,
            marginTop: spacing.l,
            borderRadius: rounded.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        cardSelected: {
            borderColor: theme.colors.textTertiary,
            borderWidth: 1,
        },
        cardInner: {
            flex: 1,
        },
        title: {
            fontSize: 22,
        },
        description: {
            fontSize: 14,
        },
        checkmark: {
            fontSize: 24,
            color: theme.colors.primary,
        },
    });
