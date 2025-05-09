import {AppTheme, spacing} from '@/utils/styles';
import {StyleSheet} from 'react-native';

export const privateCardStyles = (theme: AppTheme) =>
    StyleSheet.create({
        cardWrap: {
            paddingHorizontal: spacing.l,
            paddingVertical: spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
        },
        cartTitle: {
            flex: 1,
        },
        cardValue: {
            fontFamily: 'Font-600',
            color: theme.colors.textSecondary,
        },
        cardWrapInner: {
            flex: 1,
        },
        cardInfo: {
            color: theme.colors.textSecondary,
            marginTop: spacing.xs,
            fontSize: 12,
        },
    });
