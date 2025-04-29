import React, {useCallback, useMemo, useState} from 'react';
import {StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';
import Checkbox from '@/components/Checkbox/Checkbox';
import Pressable from '@/components/Button/Pressable';
import {ToastController} from '@/components/Toast/Toast';
import {apiLogin, getApiLoginParamsWithSigner} from '@/utils/api/authLogin';
import {Chain} from '@/chains/chain';
import bs58 from 'bs58';
import {AccessToken} from '@/storage/token';
import {CommonActions} from '@react-navigation/native';
import {navigateDispatch} from '@/navigation/shared';
import {getAccountStore} from '@/storage/accountStore';
import {getChainOperations} from '@/chains/chainOperations';
import {MAX_ACCOUNTS_PER_WALLET} from '@/constants/values';

interface Props {}

const AddAccountModal = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const snapPoints = useMemo(() => ['40%', '60%', '80%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.75} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const [understand1, setUnderstand1] = useState(false);
    const [understand2, setUnderstand2] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = useCallback(() => {
        ref.current?.dismiss();
    }, []);

    const onAddAccount = async () => {
        if (!understand1 || !understand2) {
            ToastController.show({kind: 'error', content: 'Please check the checkboxes'});
            return;
        }
        if (isCreating) {
            return;
        }
        try {
            const store = getAccountStore();
            const currentAccountID = store.currentAccountID();
            if (!currentAccountID) {
                console.log('no current account found');
                return;
            }
            const currentWallet = store.getCurrentWalletAllByAccountID(currentAccountID);
            if (!currentWallet || !currentWallet.mnemonic) {
                console.log('no current wallet found');
                return;
            }
            const nextPath = store.getNextPathIndex(currentWallet?.id);
            const ops = getChainOperations(Chain.Solana);
            if (!ops) {
                console.log('no chain operations found');
                return;
            }
            const solanaKey = await ops.generateKeyFromMnemonic(currentWallet.mnemonic, nextPath);
            const loginParams = await getApiLoginParamsWithSigner(solanaKey);
            const res = await apiLogin(loginParams);
            setIsCreating(false);
            if (res && res.data?.access_token) {
                AccessToken.store(solanaKey.address, res.data.access_token, res.data.expires_in);
                await getAccountStore().createNextAccountAtPathIndex(currentWallet.id, nextPath);
                navigateDispatch(CommonActions.reset({index: 1, routes: [{name: 'Main'}]}));
                return;
            }
        } catch (e) {
            setIsCreating(false);
            ToastController.show({kind: 'error', content: `Error: ${JSON.stringify(e)}`});
        } finally {
            setIsCreating(false);
        }
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
            <ModalHead title={'Create new account'} onClose={onClose} />
            <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.limit}>
                    You are limited to a maximum of {MAX_ACCOUNTS_PER_WALLET} accounts per device
                </Text>
                <Pressable
                    style={styles.checkWrap}
                    onPress={() => {
                        setUnderstand1(v => !v);
                    }}>
                    <Checkbox
                        containerStyle={styles.checkbox}
                        innerStyle={styles.checkboxInner}
                        value={understand1}
                        onValueChange={setUnderstand1}
                    />
                    <Text style={styles.explainer}>
                        A new account will be created for you. This account is the next index in your wallet.
                    </Text>
                </Pressable>
                <Pressable
                    style={styles.checkWrap}
                    onPress={() => {
                        setUnderstand2(v => !v);
                    }}>
                    <Checkbox
                        containerStyle={styles.checkbox}
                        innerStyle={styles.checkboxInner}
                        value={understand2}
                        onValueChange={setUnderstand2}
                    />
                    <Text style={styles.explainer}>
                        You can recover all your accounts with the same recovery phrase.
                    </Text>
                </Pressable>
                <Separator space={spacing.l} />
                <Button
                    isLoading={isCreating}
                    disabled={!understand1 || !understand2}
                    title={'Create Account'}
                    onPress={onAddAccount}
                />
            </BottomSheetScrollView>
        </BottomSheetModal>
    );
};

const dynamicStyles = (theme: AppTheme) =>
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
        limit: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            lineHeight: 22,
        },
        explainer: {
            color: theme.colors.textPrimary,
            fontSize: 16,
            lineHeight: 22,
        },
        checkWrap: {
            ...theme.cardVariants.simple,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.m,
            padding: spacing.m,
            borderRadius: rounded.l,
        },
        checkbox: {
            borderRadius: rounded.m,
            marginRight: spacing.m,
            borderWidth: 2,
            height: 24,
            width: 24,
            borderColor: theme.colors.textPrimary,
        },
        checkboxInner: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        understandText: {
            fontFamily: 'Font-500',
            flex: 1,
        },
    });

export default React.forwardRef(AddAccountModal);
