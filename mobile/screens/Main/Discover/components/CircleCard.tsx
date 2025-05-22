import React from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {formatAmount, formatComma} from '@/utils/helper/numberFormatter';
import {palette, rounded} from '@/utils/styles';
import Pressable from '@/components/Button/Pressable';
import Text from '@/components/Text/Text';
import {Feather} from '@expo/vector-icons';
import {navigate} from '@/navigation/shared';

interface CircleCardProps {
    id: string;
    name: string;
    coverPhoto: string;
    memberCount: number;
    tokenRequirement?: {
        coinSymbol: string;
        amount: number;
        coinIcon?: string;
    };
    isVerified?: boolean;
    category?: string;
    isJoined?: boolean;
    onPress?: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({
    id,
    name,
    coverPhoto,
    memberCount,
    tokenRequirement,
    isVerified = false,
    category,
    isJoined = false,
}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onPress = () => {
        navigate('Circle', {id: id, name: name, thumbnail: coverPhoto});
    };

    return (
        <Pressable style={styles.card} onPress={onPress}>
            {/* Cover Image */}
            <View style={styles.imageContainer}>
                <Image source={{uri: coverPhoto}} style={styles.coverImage} />
                <View style={styles.overlay} />

                {/* Category Badge */}
                {category && (
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText} weight="600">
                            {category.toUpperCase()}
                        </Text>
                    </View>
                )}

                {/* Join Status */}
                {isJoined && (
                    <View style={styles.joinedBadge}>
                        <Text style={styles.joinedText} weight="600">
                            JOINED
                        </Text>
                    </View>
                )}
            </View>

            {/* Card Content */}
            <View style={styles.content}>
                {/* Title Row */}
                <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1} weight="700">
                        {name}
                    </Text>
                    {isVerified && (
                        <View style={styles.verifiedBadge}>
                            <Feather
                                name="check"
                                size={styles.verifiedIcon.fontSize}
                                color={styles.verifiedIcon.color}
                            />
                        </View>
                    )}
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber} weight="600">
                            {formatComma(memberCount)}
                        </Text>
                        <Text style={styles.statLabel} color="secondary">
                            members
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.requirementContainer}>
                        {tokenRequirement ? (
                            <View style={styles.tokenRequirement}>
                                <View style={styles.tokenInfo}>
                                    <Text style={styles.tokenAmount} weight="700">
                                        {formatAmount(tokenRequirement.amount)}
                                    </Text>
                                    <Text style={styles.tokenSymbol} weight="600">
                                        {tokenRequirement.coinSymbol}
                                    </Text>
                                </View>
                                <Text style={styles.requirementLabel} weight="500">
                                    to join
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.freeJoin}>
                                <Text style={styles.freeText} weight="600">
                                    FREE
                                </Text>
                                <Text style={styles.requirementLabel} weight="500">
                                    to join
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.cardVariants.simple.backgroundColor,
            borderRadius: rounded.l,
            overflow: 'hidden',
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
        },
        imageContainer: {
            position: 'relative',
            height: 140,
        },
        coverImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
        },
        categoryBadge: {
            position: 'absolute',
            top: 12,
            left: 12,
            backgroundColor: 'rgba(139, 69, 255, 0.9)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        categoryText: {
            color: '#FFFFFF',
            fontSize: 10,
            letterSpacing: 0.5,
        },
        joinedBadge: {
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(34, 197, 94, 0.9)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        joinedText: {
            color: '#FFFFFF',
            fontSize: 10,
            letterSpacing: 0.5,
        },
        content: {
            padding: 16,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        title: {
            flex: 1,
            fontSize: 18,
            letterSpacing: -0.3,
        },
        verifiedBadge: {
            backgroundColor: '#1DA1F2',
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
        },
        verifiedIcon: {
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: '700',
        },
        statsRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statItem: {
            alignItems: 'center',
        },
        statNumber: {
            fontSize: 16,
            marginBottom: 2,
        },
        statLabel: {
            fontSize: 12,
            fontWeight: '500',
        },
        divider: {
            width: 1,
            height: 24,
            backgroundColor: theme.colors.border,
            marginHorizontal: 16,
        },
        requirementContainer: {
            flex: 1,
            alignItems: 'flex-end',
        },
        tokenRequirement: {
            alignItems: 'flex-end',
        },
        tokenInfo: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 2,
        },
        tokenAmount: {
            color: palette.amber500,
            fontSize: 16,
            marginRight: 4,
        },
        tokenSymbol: {
            color: palette.amber500,
            fontSize: 12,
            textTransform: 'uppercase',
        },
        requirementLabel: {
            fontSize: 12,
        },
        freeJoin: {
            alignItems: 'flex-end',
        },
        freeText: {
            color: '#22C55E',
            fontSize: 16,
            fontWeight: '700',
            marginBottom: 2,
        },
    });
