import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import {View, StyleSheet} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {memo} from 'react';
import Pressable from '@/components/Button/Pressable';
import {useNavigation} from '@react-navigation/native';
import Image from '@/components/Image/Image';

type Inbox = {
    thumbnail: string;
    username: string;
};

const SampleStatus = [
    {
        username: 'SpaceGirl',
        thumbnail: 'https://cdn.midjourney.com/1d3d959d-20c1-4e4b-b98a-a889af76564c/0_3.webp',
    },
    {
        username: 'WitchDoctor',
        thumbnail: 'https://cdn.midjourney.com/5820c821-6c69-490d-a6f2-1477a6f3e7f0/0_3.webp',
    },
    {
        username: 'AwesomeKorean',
        thumbnail: 'https://cdn.midjourney.com/b659c0a8-9ae9-4520-be96-bc8db815cdc7/0_0.webp',
    },
    {
        username: 'LaProfesora',
        thumbnail: 'https://cdn.midjourney.com/cced2f29-db74-4fef-a218-880271e5adfc/0_0.webp',
    },
    {
        username: 'CoffeeLover',
        thumbnail: 'https://cdn.midjourney.com/fdb851e4-dd3c-40fe-b8ff-3dbad65eaeb9/0_2.webp',
    },
];

export function Inbox() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <>
            {SampleStatus.map((inbox, index) => (
                <InboxCard key={index} {...inbox} />
            ))}
        </>
    );
}

const dynamicStyles = (theme: AppTheme) => StyleSheet.create({});

const InboxCard = memo(({username, thumbnail}: {username: string; thumbnail: string}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, inboxCardStyles);
    const navigation = useNavigation();

    return (
        <Pressable
            style={styles.container}
            onPress={() => {
                navigation.navigate('ChatRoom');
            }}>
            <Image uri={thumbnail} style={styles.thumbnail} />
            <View style={styles.mid}>
                <Text style={styles.username} weight={'600'}>
                    {username}
                </Text>
                <Text style={styles.lastText} numberOfLines={1}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et
                </Text>
            </View>
        </Pressable>
    );
});

const inboxCardStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.m,
            borderRadius: rounded.l,
        },
        thumbnail: {
            borderRadius: rounded.full,
            marginRight: spacing.l,
            height: 64,
            width: 64,
        },
        mid: {
            flex: 1,
        },
        username: {},
        lastText: {
            color: theme.colors.textSecondary,
        },
    });
