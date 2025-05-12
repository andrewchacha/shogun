import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import {FontAwesome5} from '@expo/vector-icons';
import Button from '@/components/Button/Button';

interface Props {
    onConfirm: () => void;
}

const WalletNotFoundDialog = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);

    const snapPoints = useMemo(() => [320, 450, '80%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.8} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = () => ref.current?.close();

    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}>
            <ModalHead title={''} onClose={onClose} />
            <View style={styles.scrollView}>
                <FontAwesome5 name="user-slash" style={styles.missingIcon} />
                <Text style={styles.triedText} weight={'500'}>
                    Tried to import wallet but couldn't find any account associated with this wallet.
                </Text>
                <Text style={styles.tryInfo}>You can still create a new account with this wallet.</Text>
                <View style={styles.actionButtons}>
                    <Button title={'Cancel'} variant={'secondary'} onPress={onClose} containerStyle={styles.button} />
                    <Button title={'Create Account'} onPress={props.onConfirm} containerStyle={styles.button} />
                </View>
            </View>
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
        missingIcon: {
            alignSelf: 'center',
            fontSize: 60,
            color: theme.colors.textSecondary,
        },
        triedText: {
            padding: spacing.l,
            textAlign: 'center',
            fontSize: 16,
        },
        tryInfo: {
            textAlign: 'center',
        },
        actionButtons: {
            marginTop: spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.s,
        },
        button: {
            flex: 1,
        },
    });

export default React.forwardRef(WalletNotFoundDialog);
