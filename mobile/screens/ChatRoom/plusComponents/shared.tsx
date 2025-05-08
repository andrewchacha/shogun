import React from 'react';
import Pressable from '@/components/Button/Pressable';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import Text from '@/components/Text/Text';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';

const PlusItem = ({children, onPress}: {children: React.ReactNode; onPress: () => void}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <Pressable onPress={onPress} style={[styles.plusItem]}>
            {children}
        </Pressable>
    );
};

const IconComponent = ({
    name,
    color,
    IconLib,
}: {
    name: string;
    color?: string;
    IconLib: React.ComponentType<{name: string; style: object}>;
}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <View style={styles.plusItemIconWrap}>
            <IconLib name={name} style={[styles.plusItemIcon, color ? {color} : {}]} />
        </View>
    );
};

const TitleComponent = ({title}: {title: string}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return <Text style={styles.plusItemTitle}>{title}</Text>;
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        plusItem: {
            alignItems: 'center',
            gap: spacing.s,
            maxWidth: 80,
        },
        plusItemIconWrap: {
            ...theme.cardVariants.tagMute,
            backgroundColor: theme.colors.cardBackgroundLight,
            borderWidth: StyleSheet.hairlineWidth,
            padding: spacing.m,
            borderRadius: rounded.xl,
            width: 54,
            height: 54,
            alignItems: 'center',
            justifyContent: 'center',
        },
        plusItemIcon: {
            fontSize: 20,
            color: theme.colors.textPrimary,
        },
        plusItemTitle: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-600',
            textAlign: 'center',
            fontSize: 12,
        },
    });

PlusItem.Icon = IconComponent;
PlusItem.Title = TitleComponent;

export default PlusItem;
