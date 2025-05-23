import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import {ModalBackdrop} from '../ModalBackdrop/ModalBackdrop';

interface Props {}

const ContactPickerModal = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
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
            backdropComponent={ModalBackdrop}
            enableDynamicSizing={true}>
            <BottomSheetView>
                <ModalHead title={'Select Contact'} onClose={onClose} />
                <View style={styles.scrollView}>
                    <Text>Seleect your contact</Text>
                </View>
            </BottomSheetView>
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
    });

export default React.forwardRef(ContactPickerModal);
