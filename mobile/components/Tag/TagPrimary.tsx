import {rounded, spacing} from '@/utils/styles';
import React from 'react';
import type {ReactNode} from 'react';

import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {type StyleProp, StyleSheet, type TextStyle, type ViewStyle} from 'react-native';
import Pressable from '@/components/Button/Pressable';

interface Props {
    title: string;
    onPress?: () => void;
    icon?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    isSelected?: boolean;
    iconStyle?: StyleProp<TextStyle>;
}

const TagPrimary = React.memo(({title, icon, onPress, containerStyle, textStyle, isSelected}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const renderIconWithStyle = () => {
        if (React.isValidElement(icon)) {
            return React.cloneElement(icon, {
                // @ts-ignore
                style: [styles.icon, isSelected && styles.iconSelected, icon.props.style],
            });
        }
    };
    return (
        <Pressable style={[styles.container, isSelected && styles.containerSelected, containerStyle]} onPress={onPress}>
            {icon && renderIconWithStyle()}
            <Text style={[styles.text, isSelected && styles.textSelected, textStyle]} weight={'500'}>
                {title}
            </Text>
        </Pressable>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            borderWidth: 1,
            borderColor: theme.colors.borderDeep,
            borderRadius: rounded.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.s,
            paddingHorizontal: spacing.m,
            gap: spacing.m,
        },
        containerSelected: {
            backgroundColor: theme.colors.primary,
        },
        text: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        textSelected: {
            color: theme.colors.textPrimaryInvert,
        },
        icon: {
            fontSize: 14,
            color: theme.colors.textPrimary,
        },
        iconSelected: {
            color: theme.colors.textPrimaryInvert,
        },
    });

export default TagPrimary;
