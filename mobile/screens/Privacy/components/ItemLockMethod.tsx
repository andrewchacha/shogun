import Pressable from '@/components/Button/Pressable';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/Text/Text';
import React, {useCallback, useMemo, useRef} from 'react';
import {useThemeStyleSheet} from '@/hooks/utility/useThemeStyleSheet';
import {privateCardStyles} from '@/screens/Privacy/components/sharedStyles';
import {useMMKVString} from 'react-native-mmkv';
import {StorageKeys} from '@/constants/storage';
import {encryptedStorage} from '@/storage/mmkv';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {AppTheme, spacing} from '@/utils/styles';
import ModalHead from '@/components/ModalHead/ModalHead';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {Feather} from '@expo/vector-icons';

//TODO - implement methods

const LockMethods = ['biometric', 'pin'] as const;
type LockMethod = (typeof LockMethods)[number];

export function ItemLockMethod() {
    const snapPoints = useMemo(() => [240, 300], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );
    const styles = useThemeStyleSheet(privateCardStyles);
    const sheetStyles = useThemeStyleSheet(dynamicStyles);
    const [lockMethod, setLockMethod] = useMMKVString(StorageKeys.lockMethod, encryptedStorage);
    const modalRef = useRef<BottomSheetModal>(null);
    const {handleSheetPositionChange} = useBottomSheetBackHandler(modalRef);
    const onClose = useCallback(() => {
        modalRef.current?.close();
    }, []);
    const openModal = useCallback(() => {
        modalRef.current?.present();
    }, []);

    const changeLockMethod = (method: LockMethod) => {
        //TODO verify first
        setLockMethod(method);
        onClose();
    };

    return (
        <>
            <Pressable style={styles.cardWrap} onPress={openModal}>
                <View style={styles.cardWrapInner}>
                    <Text style={styles.cartTitle}>Lock Method</Text>
                    <Text style={styles.cardInfo}>Lock your app when it goes to the background.</Text>
                </View>
                <Text style={[styles.cardValue, {textTransform: 'capitalize'}]}>{lockMethod}</Text>
            </Pressable>
            <BottomSheetModal
                enablePanDownToClose
                backgroundStyle={sheetStyles.container}
                handleIndicatorStyle={sheetStyles.indicator}
                ref={modalRef}
                onChange={handleSheetPositionChange}
                backdropComponent={renderBackdrop}
                snapPoints={snapPoints}>
                <ModalHead title={'Lock Method'} onClose={onClose} />
                <View style={sheetStyles.scrollView}>
                    {LockMethods.map(method => (
                        <Pressable key={method} style={sheetStyles.wrapItem} onPress={() => changeLockMethod(method)}>
                            <Text style={sheetStyles.title}>{method}</Text>
                            {method === lockMethod && <Feather name="check" style={sheetStyles.check} />}
                        </Pressable>
                    ))}
                </View>
            </BottomSheetModal>
        </>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.modalBackground,
        },
        scrollView: {
            marginHorizontal: spacing.th,
            marginTop: spacing.l,
            gap: spacing.m,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        wrapItem: {
            ...theme.cardVariants.tag,
            padding: spacing.l,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        title: {
            textTransform: 'capitalize',
        },
        check: {
            color: theme.colors.textPrimary,
            fontSize: 18,
        },
    });
