import {AppTheme, spacing} from '@/utils/styles';
import {StyleSheet} from 'react-native';

export const sectionItemStyle = (theme: AppTheme) =>
    StyleSheet.create({
        sectionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
        },
        sectionIcon: {
            color: theme.colors.textSecondary,
            marginRight: spacing.m,
            fontSize: 20,
            height: 20,
            width: 20,
        },
        sectionLabel: {
            flex: 1,
        },
        sectionValue: {
            fontFamily: 'Font-500',
        },
    });
