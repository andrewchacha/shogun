import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {UserSimple} from '@/utils/api/userSearch';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import Image from '@/components/Image/Image';
import Text from '@/components/Text/Text';
import Pressable from '@/components/Button/Pressable';

type Props = UserSimple & {
    onPress?: () => void;
};

export const SearchUser = ({id, thumbnail, name, username, onPress}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <Pressable style={styles.container} onPress={onPress}>
            <Image style={styles.thumbnail} uri={thumbnail.uri} blurHash={thumbnail.blurhash} />
            <View>
                <Text weight={'600'}>@{username}</Text>
                <Text>{name}</Text>
            </View>
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.simple,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
            borderRadius: rounded.xl,
        },
        thumbnail: {
            borderRadius: rounded.full,
            marginRight: spacing.m,
            height: 60,
            width: 60,
        },
    });
