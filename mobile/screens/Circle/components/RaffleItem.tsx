import {memo, useEffect, useState} from 'react';
import {FeedChatRaffle, FeedDataRaffle} from './chatsamples';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {palette, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import {ScrollView} from 'react-native-gesture-handler';
import {Entypo, Feather, FontAwesome6, MaterialIcons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Pressable from '@/components/Button/Pressable';
import {FeedChatItem} from './chatsamples';
import {hideMiddle} from '@/utils/helper/formatter';
import {formatDate} from '@/utils/helper/date';
import {formatDistanceToNow} from 'date-fns';
import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';

function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export const RaffleItem = memo(({address, pool_size, coin, ticket_price}: FeedDataRaffle) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [seconds, setSeconds] = useState(400);

    useEffect(() => {
        if (seconds <= 0) return;

        const interval = setInterval(() => {
            setSeconds(s => s - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    return (
        <View style={styles.container}>
            <View style={styles.topWrap}>
                <View style={{width: 120}}>
                    <Text style={styles.title} weight="600">
                        RAFFLE
                    </Text>
                    <Text
                        style={[
                            styles.countdown,
                            {fontSize: 24, color: theme.isDark ? palette.amber400 : palette.amber800},
                        ]}
                        weight="300">
                        {formatTime(seconds)}
                    </Text>
                </View>
                <View>
                    <Text style={styles.title} weight="600">
                        POOL
                    </Text>
                    <Text
                        style={[styles.countdown, {color: theme.isDark ? palette.amber200 : palette.amber600}]}
                        weight="600">
                        {pool_size} USDC
                    </Text>
                </View>
            </View>
            <Text style={styles.explainer} weight="500">
                Only one winner takes the entire pool!
            </Text>
            <Text style={styles.explainer} weight="500">
                1 Ticket = {ticket_price} USDC
            </Text>
            <Separator space={spacing.m} />
            <Button title={'Buy Tickets'} variant="primary" onPress={() => {}} />
            <Separator space={spacing.m} />
            <View style={styles.updateWrap}>
                <Entypo name="arrow-bold-right" size={14} color={palette.sky500} />
                <Text style={styles.update}>baraka.sui bought 5 tickets just 15s ago</Text>
            </View>
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            padding: spacing.xl,
            borderWidth: 2,
            borderColor: palette.amber500,
            backgroundColor: theme.isDark ? palette.dark700 : palette.neutral100,
            borderRadius: rounded.xl,
            boxShadow: '0px 8px 18px rgba(245, 158, 11, 0.15)',
            // alignItems: 'center',
        },
        topWrap: {
            flexDirection: 'row',
            marginBottom: spacing.m,
            // alignItems: 'center',
        },
        title: {
            fontSize: 16,
        },
        countdown: {
            fontSize: 40,
            color: theme.colors.textSecondary,
        },
        explainer: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        updateWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
        },
        update: {
            color: palette.sky500,
            fontSize: 12,
        },
    });
