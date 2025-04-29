import React, {
    type MutableRefObject,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import {AccountItem} from '@/components/MultiAccountModal/AccountItem';
import {FontAwesome6} from '@expo/vector-icons';
import AddAccountModal from '@/components/MultiAccountModal/AddAccountModal';
import Pressable from '@/components/Button/Pressable';
import * as Haptics from 'expo-haptics';
import {useAccounts, useCurrentAccountID} from '@/storage/accountStoreHooks';
import {getAccountStore} from '@/storage/accountStore';
import {MAX_ACCOUNTS_PER_WALLET} from '@/constants/values';
import {ToastController} from '@/components/Toast/Toast';

export type ModalRef = {
    show: () => void;
    hide: () => void;
};

export class MultiAccountModalController {
    private static modalRef: MutableRefObject<ModalRef | null> = {current: null};

    static setRef(ref: MutableRefObject<ModalRef | null>) {
        MultiAccountModalController.modalRef = ref;
    }

    static show() {
        MultiAccountModalController.modalRef.current?.show();
    }

    static hide() {
        MultiAccountModalController.modalRef.current?.hide();
    }
}

export default function MultiAccountModal() {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const modalRef = useRef<ModalRef>(null);
    useLayoutEffect(() => {
        MultiAccountModalController.setRef(modalRef);
    }, []);

    useImperativeHandle(
        modalRef,
        () => ({
            show: () => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                bottomSheetRef.current?.present();
            },
            hide: () => {
                bottomSheetRef.current?.dismiss();
            },
        }),
        [],
    );

    return <MultiAccountBottomSheet ref={bottomSheetRef} />;
}

const MultiAccountBottomSheet = React.forwardRef((props: {}, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);

    const snapPoints = useMemo(() => ['40%', '60%', '80%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.75} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const currentAccountID = useCurrentAccountID();
    const [walletID, setWalletID] = useState('');

    const {result: accounts} = useAccounts(walletID || '');

    useEffect(() => {
        if (!currentAccountID) return;
        const store = getAccountStore();
        const walletID = store.getWalletIDForAccountID(currentAccountID);
        if (!walletID) return;
        setWalletID(walletID);
    }, [currentAccountID]);

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const onClose = useCallback(() => ref.current?.close(), []);
    const addAccountRef = useRef<BottomSheetModal>(null);

    const openAddAccount = useCallback(() => {
        const store = getAccountStore();
        const currAccount = store.currentAccount();
        const count = store.countAccountsForWallet(currAccount.wallet_id);
        if (count >= MAX_ACCOUNTS_PER_WALLET) {
            ToastController.show({
                content: 'You have reached the maximum number of accounts allowed',
                kind: 'error',
            });
            return;
        }
        addAccountRef.current?.present();
    }, []);

    if (!accounts) return null;
    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}>
            <ModalHead title={'Accounts'} onClose={onClose} />
            <BottomSheetScrollView contentContainerStyle={styles.scrollView}>
                {accounts.map(acc => (
                    <AccountItem key={acc.id} {...acc} onClose={onClose} />
                ))}
                <Pressable style={styles.addWrapper} onPress={openAddAccount}>
                    <FontAwesome6 name="add" style={styles.addIcon} />
                    <View style={{flex: 1}}>
                        <Text style={styles.addText}>Add Account</Text>
                    </View>
                </Pressable>
            </BottomSheetScrollView>
            <AddAccountModal ref={addAccountRef} />
        </BottomSheetModal>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.modalBackground,
        },
        scrollView: {
            marginHorizontal: spacing.th,
            marginTop: spacing.l,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        addWrapper: {
            ...theme.cardVariants.simple,
            padding: spacing.l,
            borderRadius: rounded.l,
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
        },
        addIcon: {
            color: theme.colors.textPrimary,
            fontSize: 18,
            marginRight: spacing.m,
        },
        addText: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-600',
        },
        addExplain: {
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
    });
