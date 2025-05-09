import React, {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import BottomSheetTextInput from '@/components/TextInput/BottomSheetTextInput';
import Button from '@/components/Button/Button';

interface Props {}

const SearchNewAddressModal = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const snapPoints = useMemo(() => [300, 500, '94%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [address, setAddress] = useState('');

    const onSearch = () => {};
    const onClose = () => ref.current?.close();
    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            keyboardBehavior={'extend'}
            snapPoints={snapPoints}>
            <ModalHead title={'Search User'} onClose={onClose} />
            <BottomSheetScrollView style={styles.scrollView}>
                <Text style={styles.label}>Address</Text>
                <BottomSheetTextInput placeholder={'Enter Address'} returnKeyType={'done'} />
                <Button title={'Search'} onPress={onSearch} variant={'primary'} disabled={!address} />
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
            marginTop: spacing.l,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        label: {
            color: theme.colors.textSecondary,
            marginBottom: spacing.xs,
            marginLeft: spacing.xs,
            fontSize: 14,
        },
    });

export default React.forwardRef(SearchNewAddressModal);
