import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {StyleSheet, View} from 'react-native';
import {FontAwesome6} from '@expo/vector-icons';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import PlusItem from '@/screens/ChatRoom/plusComponents/shared';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import React, {forwardRef, useCallback, useMemo} from 'react';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import ModalHead from '@/components/ModalHead/ModalHead';
import Text from '@/components/Text/Text';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';

export function PlusCrypto() {
    const sendCryptoModalRef = React.useRef<BottomSheetModal>(null);
    const openSendCryptoModal = useCallback(() => sendCryptoModalRef.current?.present(), []);
    const theme = useAppTheme();

    return (
        <>
            <PlusItem onPress={openSendCryptoModal}>
                <PlusItem.Icon IconLib={FontAwesome6} name="money-bills" />
                <PlusItem.Title title="Crypto" />
            </PlusItem>
            <SendCryptoModal ref={sendCryptoModalRef} />
        </>
    );
}

type Props = {};

const SendCryptoModal = forwardRef((props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);

    const snapPoints = useMemo(() => [250, 500, '94%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.5} disappearsOnIndex={-1} appearsOnIndex={0} />,
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
            <ModalHead title={'Send Crypto'} onClose={onClose} />
            <View style={styles.scrollView}>
                <Text>Pick chain to use</Text>
                <View style={styles.chainWrapper}>
                    <ChainLogo chain={'solana'} />
                    <Text style={styles.chainText}>Solana</Text>
                    <Text style={styles.totalValue}>~$500</Text>
                </View>
                <View style={styles.chainWrapper}>
                    <ChainLogo chain={'sui'} />
                    <Text style={styles.chainText}>Sui</Text>
                    <Text style={styles.totalValue}>~$500</Text>
                </View>
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
        chainWrapper: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
            alignItems: 'center',
            flexDirection: 'row',
            marginTop: spacing.m,
            padding: spacing.m,
            gap: spacing.l,
        },
        chainText: {
            flex: 1,
        },
        totalValue: {
            color: theme.colors.textSecondary,
        },
    });
