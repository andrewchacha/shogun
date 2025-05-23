import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme} from '@/utils/styles/theme';
import React, {memo} from 'react';
import {View, ScrollView, StyleSheet} from 'react-native';
import Image from '@/components/Image/Image';
import Text from '@/components/Text/Text';
import {spacing} from '@/utils/styles';

const AvatarItem = memo(({id, name, uri}: Avatar) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    if (!uri)
        return (
            <View style={styles.avatarContainer}>
                <Text style={styles.initialsText} weight="600">
                    {name}
                </Text>
            </View>
        );
    return (
        <View style={styles.avatarContainer}>
            <Image uri={uri} style={styles.avatar} />
        </View>
    );
});

export const AvatarList = memo(({avatars}: {avatars: Avatar[]}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.container}
            contentContainerStyle={styles.scrollContainer}>
            {avatars.map(avatar => (
                <AvatarItem key={avatar.id} {...avatar} />
            ))}
        </ScrollView>
    );
});

export type Avatar = {
    id: string;
    uri: string;
    name: string;
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginTop: spacing.m,
        },
        scrollContainer: {
            alignItems: 'center',
        },
        avatarContainer: {
            marginRight: -10,
            width: 48,
            height: 48,
            borderRadius: 30,
            borderWidth: 4,
            overflow: 'hidden',
            borderColor: theme.colors.mainBackground,
            backgroundColor: theme.colors.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
        },
        avatar: {
            width: '100%',
            height: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        initialsText: {
            fontSize: 14,
        },
    });
