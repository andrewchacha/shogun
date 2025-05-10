import React, {useEffect, useRef, useState} from 'react';
import {View, Animated, StyleSheet, LayoutChangeEvent} from 'react-native';
import Image from '@/components/Image/Image';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import Text from '@/components/Text/Text';
import {useMe} from '@/hooks/api/useMe';
import {hideMiddle} from '@/utils/helper/formatter';
import {SendCryptoConfirmParams} from '@/navigation/types';

const DOT_SIZE = 5;
const DOT_MARGIN = 3;
const DOT_SPACING = DOT_SIZE + DOT_MARGIN * 2;
const DOT_ANIMATION_DURATION = 2000;

type Props = SendCryptoConfirmParams & {
    isSending: boolean;
};

export const MoneyTransferAnimation = ({fromAddress, toUser, toAddress, isSending}: Props) => {
    const {data: me} = useMe(true);

    const [numDots, setNumDots] = useState(0);
    const animationRef = useRef(new Animated.Value(0)).current;
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useEffect(() => {
        if (isSending && numDots > 0) {
            startAnimation();
        } else {
            animationRef.setValue(0);
        }
    }, [isSending, numDots]);

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animationRef, {
                    toValue: numDots,
                    duration: DOT_ANIMATION_DURATION,
                    useNativeDriver: true,
                }),
                Animated.timing(animationRef, {
                    toValue: 0,
                    duration: DOT_ANIMATION_DURATION,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    };

    const onLayout = (event: LayoutChangeEvent) => {
        const {width} = event.nativeEvent.layout;
        const calculatedNumDots = Math.floor(width / DOT_SPACING);
        setNumDots(calculatedNumDots);
    };

    const renderDots = () => {
        return Array(numDots)
            .fill(0)
            .map((_, index) => {
                const inputRange = [index - 2, index, index + 2];
                const opacity = animationRef.interpolate({
                    inputRange,
                    outputRange: [0.4, 1, 0.4],
                    extrapolate: 'clamp',
                });
                const scale = animationRef.interpolate({
                    inputRange,
                    outputRange: [1, 2, 1],
                    extrapolate: 'clamp',
                });

                return (
                    <View key={index} style={styles.dotContainer}>
                        <View style={[styles.dot, !isSending && styles.grayDot]} />
                        <Animated.View
                            style={[
                                styles.dot,
                                styles.tealDot,
                                {transform: [{scale}]},
                                {opacity: isSending ? opacity : 0},
                            ]}
                        />
                    </View>
                );
            });
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.imageWrap}>
                    <Image
                        uri={me?.data?.thumbnail?.uri}
                        blurHash={me?.data?.thumbnail?.blurhash}
                        style={[styles.thumbnail, isSending && styles.thumbnailAnimating]}
                    />
                    <Text style={styles.username}>@{me?.data?.username}</Text>
                    <Text style={styles.address}>{hideMiddle(fromAddress)}</Text>
                </View>
                <View style={styles.dotsContainer} onLayout={onLayout}>
                    {renderDots()}
                </View>
                <View style={styles.imageWrap}>
                    <Image uri={toUser?.thumbnail} style={[styles.thumbnail, isSending && styles.thumbnailAnimating]} />
                    <Text style={styles.username}>@{toUser?.username}</Text>
                    <Text style={styles.address}>{hideMiddle(toAddress)}</Text>
                </View>
            </View>
        </>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        thumbnail: {
            borderRadius: rounded.full,
            width: 64,
            height: 64,
        },
        thumbnailAnimating: {
            borderWidth: 2,
            borderColor: theme.isDark ? palette.teal400 : palette.teal500,
        },
        midWrap: {
            marginHorizontal: spacing.m,
            alignItems: 'center',
            flex: 1,
        },
        dotsContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        dotContainer: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            marginHorizontal: DOT_MARGIN,
        },
        dot: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: rounded.full,
            position: 'absolute',
        },
        grayDot: {
            backgroundColor: theme.colors.textSecondary,
        },
        tealDot: {
            backgroundColor: theme.isDark ? palette.teal400 : palette.teal500,
        },
        sendingText: {
            color: theme.isDark ? palette.teal400 : palette.teal500,
            marginTop: spacing.s,
        },
        imageWrap: {
            alignItems: 'center',
        },
        username: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-500',
            fontSize: 14,
            marginTop: spacing.xs,
        },
        address: {
            color: theme.colors.textTertiary,
            fontFamily: 'Font-500',
            fontSize: 12,
        },
    });
