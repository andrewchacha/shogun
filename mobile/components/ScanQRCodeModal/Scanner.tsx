import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import {AntDesign, Feather, Ionicons} from '@expo/vector-icons';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {Canvas, Group, Mask, Rect, RoundedRect} from '@shopify/react-native-skia';
import {type AppTheme, palette, rounded, spacing} from '@/utils/styles';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Dimensions, Linking, StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Camera, type Code, useCameraDevice, useCameraPermission, useCodeScanner} from 'react-native-vision-camera';
import Pressable from '@/components/Button/Pressable';

interface Props {
    onClose: () => void;
    onToggle: () => void;
}

export const Scanner = React.memo(({onClose, onToggle}: Props) => {
    const {hasPermission, requestPermission} = useCameraPermission();
    const device = useCameraDevice('back');

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useEffect(() => {
        if (!hasPermission) {
            void requestPermission();
        }
    }, []);

    const insets = useSafeAreaInsets();
    const window = Dimensions.get('window');
    const width = window.width;
    const height = window.height;

    const size = 280;
    const x = width / 2 - size / 2;
    const y = height / 2 - size / 2;

    const scanLock = useRef(false);
    const handleScannedCodes = (codes: Code[]) => {
        if (scanLock.current) {
            return;
        }
        scanLock.current = true;
        for (let i = 0; i < codes.length; i++) {
            const curr = codes[i];
            console.log(curr);
        }
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: handleScannedCodes,
    });

    return (
        <View style={styles.container}>
            {!hasPermission || device == null ? (
                <View style={styles.noPermissionContainer}>
                    <View style={styles.noPermissionInner}>
                        <Text style={styles.noPermissionText} weight={'600'}>
                            App has no permission to use the camera
                        </Text>
                        <Text style={styles.noPermissionText} weight={'600'}>
                            Allow camera permission to be able to scan QR codes.
                        </Text>
                        <Separator space={spacing.l} />
                        <Button
                            title={'Allow'}
                            variant={'secondary'}
                            onPress={() => {
                                void Linking.openSettings();
                            }}
                        />
                    </View>
                </View>
            ) : (
                <>
                    <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} codeScanner={codeScanner} />
                    <Canvas style={{width: width, height: height}}>
                        <Mask
                            mode="luminance"
                            mask={
                                <Group>
                                    <Rect x={0} y={0} width={width} height={height} color="white" />
                                    <RoundedRect x={x} y={y} width={size} height={size} r={rounded.xl} color="black" />
                                </Group>
                            }>
                            <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.85)" />
                        </Mask>
                        <RoundedRect
                            style="stroke"
                            strokeWidth={4}
                            x={x}
                            y={y}
                            width={size}
                            height={size}
                            r={rounded.xxl}
                            color="white"
                        />
                    </Canvas>
                </>
            )}
            <View style={[styles.innerContainer, {paddingTop: insets.top}]}>
                <View style={styles.headerContainer}>
                    <Pressable onPress={onClose}>
                        <AntDesign name="close" size={24} color={'white'} />
                    </Pressable>
                    <Text variant="subheader" style={styles.head}>
                        Scan QR Code
                    </Text>
                    <View style={{flex: 1}} />
                    <Pressable onPress={onToggle}>
                        <Ionicons name="share-outline" size={24} color={'white'} />
                    </Pressable>
                </View>
            </View>
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        innerContainer: {
            position: 'absolute',
            right: 0,
            left: 0,
            paddingRight: spacing.th,
            paddingLeft: spacing.th,
            top: 0,
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.l,
        },
        midContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        head: {
            fontSize: 20,
            color: 'white',
        },
        indicator: {
            position: 'absolute',
            backgroundColor: 'red',
            padding: 0,
            margin: 0,
        },
        qrCodeIcon: {
            marginRight: spacing.s,
            color: 'white',
            fontSize: 14,
        },
        actionButtons: {
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginRight: spacing.m,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: rounded.xl,
            borderWidth: 1,
            borderColor: palette.gray800,
        },
        actionIcon: {
            fontSize: 14,
            marginRight: spacing.m,
            color: palette.gray100,
        },
        actionText: {
            fontSize: 14,
            color: palette.gray100,
        },
        noPermissionContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        noPermissionInner: {
            height: 200,
            maxWidth: 300,
        },
        noPermissionText: {
            color: 'white',
            textAlign: 'center',
            marginTop: spacing.m,
        },
    });
