import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {memo} from 'react';
import Image from '@/components/Image/Image';

type Status = {
    thumbnail: string;
    username: string;
};

const SampleStatus = [
    {
        username: 'SpaceGirl',
        thumbnail: 'https://cdn.midjourney.com/fee5f22e-77b2-452d-9e8c-aae9e4e652bd/0_3.webp',
    },
    {
        username: 'Steve',
        thumbnail: 'https://cdn.midjourney.com/42c62f3c-8c90-40f6-b402-36215b0a7ec9/0_0.webp',
    },
    {
        username: 'Harambe',
        thumbnail: 'https://cdn.midjourney.com/dc836cb3-1893-4d57-a61f-db4ebb84340f/0_2.webp',
    },
    {
        username: 'Jane',
        thumbnail: 'https://cdn.midjourney.com/628c310c-a722-400a-bcec-23f075c555f2/0_1.webp',
    },
    {
        username: 'Jane',
        thumbnail: 'https://cdn.midjourney.com/b001b02c-b8c1-47b2-8bf1-b1fe1f39740e/0_1.webp',
    },
];

export function Statuses() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            horizontal={true}
            showsHorizontalScrollIndicator={false}>
            {SampleStatus.map((status, index) => (
                <StatusCard key={index} {...status} />
            ))}
        </ScrollView>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: -spacing.th,
        },
        contentContainer: {
            gap: spacing.l,
            paddingHorizontal: spacing.th,
        },
        searchIcon: {
            color: theme.colors.textSecondary,
            fontSize: 24,
        },
    });

const StatusCard = memo(({username, thumbnail}: Status) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, statusCardStyles);
    return (
        <View style={styles.container}>
            <Image uri={thumbnail} style={styles.thumbnail} />
            <Text style={styles.username} weight={'500'}>
                {username}
            </Text>
        </View>
    );
});

const statusCardStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        thumbnail: {
            width: 80,
            height: 80,
            borderRadius: rounded.full,
            borderWidth: 4,
            borderColor: palette.sky500,
        },
        username: {
            color: theme.colors.textSecondary,
            marginTop: spacing.xs,
            fontSize: 14,
        },
    });
