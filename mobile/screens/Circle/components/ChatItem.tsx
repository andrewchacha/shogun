import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {palette, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import {FeedChatItem} from './chatsamples';
import {memo} from 'react';
import {hideMiddle} from '@/utils/helper/formatter';
import {formatDistanceToNow} from 'date-fns';
import {RaffleItem} from './RaffleItem';
import Separator from '@/components/Separator/Separator';
import {AvatarList} from './Avatars';
import {AntDesign, FontAwesome6} from '@expo/vector-icons';
import {Prediction} from './Prediction';
import {PayRequest} from './PayRequest';
import {VoteItem} from './VoteItem';

export const ChatItem = memo(({id, user, timestamp, content, avatars, tip, payRequest}: FeedChatItem) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <View style={styles.container}>
            <View style={styles.topWrap}>
                <Image uri={user.avatar} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.userName} weight={'600'}>
                        {user.name}
                    </Text>
                    <Text style={styles.userAddress}>{hideMiddle(user.address)}</Text>
                </View>
                {tip && (
                    <View style={styles.tipWrap}>
                        <FontAwesome6 name="coins" size={14} color={palette.amber500} />
                        <Text style={styles.tip}>
                            {tip.amount} {tip.coin}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.contentWrap}>
                <Text style={styles.content}>{content.text}</Text>
            </View>

            {content.kind === 'raffle' ? <RaffleItem {...content.data} /> : null}
            {content.kind === 'prediction' ? <Prediction {...content.data} /> : null}
            {content.kind === 'vote' ? <VoteItem {...content.data} /> : null}
            {payRequest ? <PayRequest {...payRequest} /> : null}
            {avatars ? <AvatarList avatars={avatars} /> : null}

            <Separator space={spacing.m} />
            <Text style={styles.timestamp}>{formatDistanceToNow(new Date(timestamp), {addSuffix: true})}</Text>

            <View style={styles.actionsWrap}>
                <AntDesign name="like1" size={18} color={theme.colors.textSecondary} />
                <Text>{Math.floor(Math.random() * 32 + 1)}</Text>
                <Separator horizontal space={spacing.m} />
                <AntDesign name="message1" size={18} color={theme.colors.textSecondary} />
                <Text>{Math.floor(Math.random() * 32 + 1)}</Text>
                <Separator horizontal space={spacing.m} />
                <FontAwesome6 name="bookmark" size={18} color={theme.colors.textSecondary} />
                <Text>{Math.floor(Math.random() * 32 + 1)}</Text>
                <Separator horizontal space={spacing.m} />
                <FontAwesome6 name="coins" size={18} color={theme.colors.textSecondary} />
                <Text>{Math.floor(Math.random() * 32 + 1)}</Text>
            </View>
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            paddingVertical: spacing.xl,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderColor: theme.colors.border,
        },
        topWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingBottom: spacing.m,
        },
        avatar: {
            borderRadius: rounded.full,
            marginRight: spacing.m,
            height: 48,
            width: 48,
        },
        userInfo: {
            flex: 1,
        },
        userName: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        userAddress: {
            color: theme.colors.textTertiary,
            fontSize: 12,
        },
        contentWrap: {
            paddingVertical: spacing.m,
        },
        content: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        timestamp: {
            color: theme.colors.textTertiary,
            fontSize: 12,
        },
        tipWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
        },
        tip: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        actionsWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            marginTop: spacing.m,
        },
    });
