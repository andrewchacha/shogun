import React, {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import ModalHead from '@/components/ModalHead/ModalHead';
import Button from '@/components/Button/Button';
import Lottie from 'lottie-react-native';
import Image from '@/components/Image/Image';
import {Success} from '@/components/Animations/Success';

interface Props {}

type mode = 'confirm' | 'sending' | 'success';
const CryptoRequestPayModal = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);

    const snapPoints = useMemo(() => [400], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.8} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const [mode, setMode] = useState<mode>('confirm');
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = () => ref.current?.close();

    const onSend = () => {
        setMode('sending');
        setTimeout(() => {
            setMode('success');
            setTimeout(() => {
                onClose();
            }, 5000);
        }, 3000);
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
            <ModalHead title={'Crypto Request'} onClose={onClose} />
            <View style={styles.scrollView}>
                <View style={styles.topWrapper}>
                    <Image
                        uri={'https://cdn.midjourney.com/0deddab0-7640-49d9-9b0a-d928cbd94d83/0_0.webp'}
                        style={styles.thumbnail}
                    />
                    <View>
                        <Text style={styles.name} weight={'600'}>
                            Luna Kim
                        </Text>
                        <Text style={styles.description}>Pay to join the Pizza Party</Text>
                    </View>
                </View>

                {mode === 'success' && (
                    <View style={styles.sendingWrap}>
                        <Success size={100} bgColor={palette.sky500} />
                        <Text color={'secondary'}>Sent Successfully</Text>
                    </View>
                )}
                {mode === 'sending' && (
                    <View style={styles.sendingWrap}>
                        <Lottie
                            style={[{width: 100, height: 100, marginTop: spacing.l}]}
                            resizeMode="cover"
                            source={require('@/assets/animation/sending.json')}
                            autoPlay
                            loop
                        />
                        <Text color={'secondary'}>Sending crypto! Please wait</Text>
                    </View>
                )}
                {mode === 'confirm' && (
                    <>
                        <View style={styles.section}>
                            <View style={styles.row}>
                                <Text style={styles.rowKey}>Amount</Text>
                                <Text style={styles.rowValue}>500 USDC</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowKey}>Chain</Text>
                                <Text style={styles.rowValue}>Solana</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.rowKey}>Fee</Text>
                                <Text style={styles.rowValue}>0.0001 SOL</Text>
                            </View>
                        </View>
                        <Text style={styles.warning}>Careful! Do not send crypto to people you don't know</Text>
                        <Button title={'Pay'} onPress={onSend} containerStyle={styles.payButton} />
                    </>
                )}
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
            marginTop: spacing.l,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        topWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        thumbnail: {
            borderRadius: rounded.full,
            marginRight: spacing.m,
            height: 60,
            width: 60,
        },
        name: {
            color: theme.colors.textPrimary,
            fontSize: 12,
        },
        description: {
            color: theme.colors.textSecondary,
            fontSize: 16,
        },
        section: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
            marginTop: spacing.l,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: spacing.m,
        },
        rowKey: {
            color: theme.colors.textSecondary,
        },
        rowValue: {
            color: theme.colors.textPrimary,
        },
        payButton: {
            marginTop: spacing.l,
        },
        warning: {
            color: theme.colors.textSecondary,
            marginTop: spacing.s,
            marginLeft: spacing.s,
            fontSize: 10,
        },
        sendingWrap: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

export default React.forwardRef(CryptoRequestPayModal);
