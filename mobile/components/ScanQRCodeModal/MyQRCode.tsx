import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {type AppTheme, palette, rounded, spacing} from '@/utils/styles';
import React, {useCallback, useRef} from 'react';
import {Linking, Share, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useMe} from '@/hooks/api/useMe';
import QRCode from 'react-native-qrcode-svg';
import Image from '@/components/Image/Image';
import {AntDesign, Feather, Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Pressable from '@/components/Button/Pressable';
import Separator from '@/components/Separator/Separator';
import {Canvas, LinearGradient, Rect, vec} from '@shopify/react-native-skia';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface Props {
    onClose: () => void;
    onToggle: () => void;
}

export const MyQRCode = React.memo(({onClose, onToggle}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const insets = useSafeAreaInsets();
    const {data} = useMe(false);

    const viewShotRef = useRef(null);

    if (!data?.data) {
        return null;
    }

    const shareUrl = `https://shogun.social/u/${data.data.username}`;
    const onShare = useCallback(async () => {
        try {
            // @ts-ignore
            const uri = await viewShotRef.current?.capture();
            void Sharing.shareAsync(uri);
        } catch (error) {
            console.log(error);
            void Share.share({
                message: shareUrl,
            });
        }
    }, []);

    const {width, height} = useWindowDimensions();
    const gradientColors = theme.isDark
        ? [palette.amber600, palette.sky600, palette.teal600]
        : [palette.amber100, palette.sky100, palette.teal100];

    return (
        <ViewShot style={styles.container} ref={viewShotRef}>
            <Canvas style={{width: width, height: height, position: 'absolute', top: 0, left: 0, right: 0}}>
                <Rect x={0} y={0} width={width} height={height}>
                    <LinearGradient start={vec(0, 0)} end={vec(height, width)} colors={gradientColors} />
                </Rect>
            </Canvas>
            <View style={[styles.closureWrap, {paddingTop: insets.top}]}>
                <Pressable onPress={onClose}>
                    <AntDesign name="close" size={24} color={theme.colors.textPrimary} />
                </Pressable>
                <View style={{flex: 1}} />
                <Pressable onPress={onShare}>
                    <Feather name="share" size={24} color={theme.colors.textPrimary} />
                </Pressable>
                <Pressable onPress={onToggle}>
                    <Ionicons name="qr-code-outline" size={24} color={theme.colors.textPrimary} />
                </Pressable>
            </View>
            <View style={styles.innerWrap}>
                <QRCode
                    value={shareUrl}
                    size={200}
                    backgroundColor={'transparent'}
                    color={'black'}
                    logoBorderRadius={rounded.s}
                    logoMargin={spacing.s}
                    logoBackgroundColor={'white'}
                    ecl={'H'}
                />
                <Separator space={spacing.l} />
                <View style={styles.profileWrap}>
                    <Image
                        uri={data.data.thumbnail?.uri}
                        blurHash={data.data.thumbnail?.blurhash}
                        style={styles.thumbnail}
                    />
                    <View>
                        <Text style={styles.username}>@{data.data.username}</Text>
                        <Text style={styles.name}>{data.data.name}</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.scanInfo}>Scan or upload this QR code using Shogun camera to connect.</Text>
        </ViewShot>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
        },
        closureWrap: {
            position: 'absolute',
            top: 0,
            right: spacing.th,
            padding: spacing.m,
            left: spacing.th,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.l,
        },
        innerWrap: {
            ...theme.cardVariants.simple,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: rounded.xl,
            paddingVertical: spacing.xxl,
            width: '80%',
        },
        qrWrapperInner: {
            backgroundColor: theme.isDark ? 'white' : palette.neutral100,
            borderRadius: rounded.xxl,
            padding: spacing.xl,
            alignItems: 'center',
            alignSelf: 'center',
        },
        profileWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
            marginTop: spacing.m,
        },
        username: {
            color: palette.gray900,
            fontFamily: 'Font-600',
            fontSize: 16,
        },
        name: {
            color: palette.gray700,
            fontSize: 14,
        },
        thumbnail: {
            width: 46,
            height: 46,
            borderRadius: rounded.full,
        },
        actionTag: {
            ...theme.cardVariants.tagMute,
            borderWidth: 0,
            padding: spacing.m,
            backgroundColor: theme.colors.mainBackground,
        },
        actionText: {
            fontSize: 16,
            fontFamily: 'Font-500',
        },
        actionIcon: {
            fontSize: 16,
            color: theme.colors.textPrimary,
        },
        scanInfo: {
            color: theme.colors.textPrimary,
            marginTop: spacing.xl,
            textAlign: 'center',
            maxWidth: '80%',
        },
    });
