import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useCallback, useLayoutEffect} from 'react';
import {Share, StyleSheet, View} from 'react-native';
import {capitalizeFirstLetter} from '@/utils/helper/formatter';
import {hitSlop, palette, rounded, spacing} from '@/utils/styles';
import {Feather, FontAwesome6} from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import {useNavigation} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Pressable from '@/components/Button/Pressable';
import Image from '@/components/Image/Image';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';
import {useMe} from '@/hooks/api/useMe';
import {Success} from '@/components/Animations/Success';
import {useModalBackground} from '@/hooks/utility/useModalBackground';

type Props = RootStackScreenProps<'MyAddressQrCode'>;

const QR_WIDTH = 200;

const MyAddressQrCode = ({route}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {data} = useMe(false);
    const {chain, address} = route.params;
    const nav = useNavigation();

    useModalBackground();
    useLayoutEffect(() => {
        nav.setOptions({title: `${capitalizeFirstLetter(chain)} address`});
    }, []);

    const [isCopied, setCopied] = React.useState(false);

    const onCopy = useCallback(() => {
        void Clipboard.setStringAsync(address);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);
    }, [chain, address]);

    const onShare = useCallback(() => {
        void Share.share({
            message: `${capitalizeFirstLetter(chain)} address: ${address}`,
        });
    }, [chain, address]);

    return (
        <View style={styles.container}>
            <View style={styles.qrWrapper}>
                <View style={styles.actionsWrap}>
                    <View style={styles.thumbWrapper}>
                        <Image
                            uri={data?.data?.thumbnail?.uri}
                            blurHash={data?.data?.thumbnail?.blurhash}
                            style={styles.thumbnail}
                        />
                        <Text style={styles.name} weight={'500'}>
                            @{data?.data?.username}
                        </Text>
                    </View>
                    <Pressable hitSlop={hitSlop} onPress={onCopy} style={styles.actionButton}>
                        {isCopied ? (
                            <Success bgColor={theme.colors.textSecondary} size={24} />
                        ) : (
                            <FontAwesome6 name="copy" style={styles.actionIcon} />
                        )}
                    </Pressable>
                    <Pressable hitSlop={hitSlop} onPress={onShare} style={styles.actionButton}>
                        <Feather name="share" style={styles.actionIcon} />
                    </Pressable>
                </View>
                <View style={styles.qrWrapperInner}>
                    <QRCode
                        value={address}
                        size={QR_WIDTH}
                        backgroundColor={'transparent'}
                        color={'black'}
                        logoBorderRadius={rounded.s}
                        logoMargin={spacing.s}
                        logoBackgroundColor={'white'}
                        ecl={'H'}
                    />
                </View>
                <Text style={styles.address} weight={'600'}>
                    {address}
                </Text>
            </View>
            <Text style={styles.warning}>
                Only send assets on {chain} blockchain to this address.{'\n'}Sending assets from other chains may result
                in loss of funds.
            </Text>
            <ChainLogo chain={chain} style={styles.chainLogo} />
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: 40,
            flex: 1,
        },
        qrWrapper: {
            ...theme.cardVariants.simple,
            backgroundColor: theme.colors.cardBackground,
            marginBottom: spacing.s,
            borderRadius: rounded.xxl,
            marginTop: spacing.xl,
            alignSelf: 'center',
            paddingHorizontal: 32,
            paddingVertical: 32,
        },
        qrWrapperInner: {
            backgroundColor: theme.isDark ? 'white' : palette.neutral100,
            borderRadius: rounded.xxl,
            padding: spacing.xl,
            alignItems: 'center',
            alignSelf: 'center',
        },
        address: {
            marginTop: spacing.l,
            alignSelf: 'center',
            textAlign: 'center',
            maxWidth: QR_WIDTH,
        },
        actionsWrap: {
            flexDirection: 'row',
            marginBottom: spacing.l,
            // alignSelf: 'flex-end',
            gap: spacing.m,
            alignItems: 'center',
        },
        actionButton: {
            padding: spacing.xs,
        },
        actionIcon: {
            color: theme.colors.textPrimary,
            fontSize: 16,
        },
        warning: {
            color: theme.colors.textPrimary,
            marginTop: spacing.l,
            textAlign: 'center',
            fontSize: 12,
        },
        thumbWrapper: {
            alignItems: 'center',
            flexDirection: 'row',
            flex: 1,
        },
        thumbnail: {
            marginRight: spacing.xs,
            borderRadius: rounded.full,
            height: 32,
            width: 32,
        },
        name: {},
        chainLogo: {
            marginTop: spacing.m,
            alignSelf: 'center',
            width: 32,
            height: 32,
        },
    });

export default MyAddressQrCode;
