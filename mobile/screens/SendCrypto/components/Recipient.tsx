import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Text from '@/components/Text/Text';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import {hideMiddle} from '@/utils/helper/formatter';
import Pressable from '@/components/Button/Pressable';

export type RecipientProps = {
    address: string;
    thumbnail?: string;
    username?: string;
    onPress?: () => void;
    time?: string;
};

export function Recipient({address, thumbnail, username, time, onPress}: RecipientProps) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Image uri={thumbnail} preset={'sm'} style={styles.thumbnail} />
            {username && <Text style={styles.username}>@{username}</Text>}
            <Text style={styles.address}>{hideMiddle(address, 5)}</Text>
            {time && (
                <Text style={styles.recentDate} weight={'500'}>
                    {time}
                </Text>
            )}
        </Pressable>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        thumbnail: {
            width: 64,
            height: 64,
            borderRadius: rounded.full,
            marginBottom: spacing.s,
        },
        username: {
            fontSize: 14,
        },
        address: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        recentDate: {
            color: theme.colors.textTertiary,
            fontSize: 12,
        },
    });
