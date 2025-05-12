import React from 'react';
import {AppTheme, spacing, rounded} from '@/utils/styles';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/Text/Text';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';

export type StickyItem = {type: 'sticky'; label: string; timestamp: number; isSticky?: boolean};

export function StickyTitle({label, isSticky}: StickyItem) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    if (isSticky) {
        return (
            <View style={styles.containerSticky}>
                <Text style={styles.labelSticky} weight={'600'}>
                    {label}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label} weight={'600'}>
                {label}
            </Text>
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginTop: spacing.l,
        },
        containerSticky: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.full,
            alignSelf: 'flex-start',
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.l,
            marginLeft: spacing.s,
            marginTop: spacing.s,
        },
        label: {
            color: theme.colors.textSecondary,
        },
        labelSticky: {
            color: theme.colors.textPrimary,
        },
    });
