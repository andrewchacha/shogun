import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {sectionItemStyle} from '@/screens/Settings/components/shared';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import ModalHead from '@/components/ModalHead/ModalHead';
import {StyleSheet, View} from 'react-native';
import {AppTheme, spacing} from '@/utils/styles';
import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';
import TextInput from '@/components/TextInput/BottomSheetTextInput';
import {queryClient} from '@/storage/queryClient';
import {encryptedStorage} from '@/storage/mmkv';
import {CommonActions, useNavigation} from '@react-navigation/native';
import {getAccountStore} from '@/storage/accountStore';

export const ItemReset = () => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, sectionItemStyle);

    const modalRef = useRef<BottomSheetModal>(null);
    const openModal = useCallback(() => {
        modalRef.current?.present();
    }, []);

    return (
        <>
            <Pressable style={styles.sectionRow} onPress={openModal}>
                <MaterialIcons name="logout" style={styles.sectionIcon} />
                <Text style={styles.sectionLabel}>Reset Wallet</Text>
            </Pressable>
            <LogoutConfirmDialog ref={modalRef} />
        </>
    );
};

type Props = {};
const confirmationPrompt = 'DELETE';
const LogoutConfirmDialog = React.forwardRef((props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const navigation = useNavigation();

    const snapPoints = useMemo(() => [400, 500, '94%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const [prompt, setPrompt] = useState('');
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = () => ref.current?.close();
    const onLogout = () => {
        if (!prompt || prompt !== confirmationPrompt) {
            return;
        }
        //TODO remove sqlite later when chat is added
        queryClient.clear();
        encryptedStorage.clearAll();
        getAccountStore().deleteEverything();
        navigation.dispatch({
            ...CommonActions.reset({
                index: 0,
                routes: [{name: 'Welcome'}],
            }),
        });
    };

    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            keyboardBehavior={'extend'}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}>
            <ModalHead title={'Reset Wallet'} onClose={onClose} />
            <View style={styles.scrollView}>
                <AntDesign name="warning" style={styles.warningIcon} />
                <Separator space={spacing.l} />
                <Text style={styles.warning1} weight={'500'}>
                    Reset will delete all your data from this device.
                </Text>
                <Text style={styles.warning2} weight={'600'}>
                    We can't recover your accounts if you lose your recovery phrase.
                </Text>

                <Separator space={spacing.xl} />
                <Text color={'secondary'}>Write the word DELETE to confirm</Text>
                <Separator space={spacing.s} />
                <TextInput
                    placeholder={confirmationPrompt}
                    value={prompt}
                    onChangeText={setPrompt}
                    returnKeyType={'done'}
                />
                <Separator space={spacing.l} />
                <Button
                    disabled={prompt !== confirmationPrompt}
                    title={'RESET'}
                    onPress={onLogout}
                    variant={'danger'}
                />
            </View>
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
        warningIcon: {
            fontSize: 48,
            color: theme.colors.warning,
            alignSelf: 'center',
        },
        warning1: {
            textAlign: 'center',
            color: theme.colors.textSecondary,
        },
        warning2: {
            textAlign: 'center',
        },
    });
