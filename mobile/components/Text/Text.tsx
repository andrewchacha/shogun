import {useAppTheme} from '@/hooks/utility/useAppTheme';
import type {FontColors, FontWeight} from '@/utils/styles';
import type {TextVariant} from '@/utils/types/text';
import React, {useMemo} from 'react';
import {Text as NativeText, type TextProps} from 'react-native';

interface Props extends TextProps {
    variant?: TextVariant;
    weight?: FontWeight;
    color?: FontColors;
}

const Text = (props: Props) => {
    const {variant = 'body', color = 'primary', weight, style} = props;

    const theme = useAppTheme();
    const textColor = useMemo(() => {
        switch (color) {
            case 'secondary':
                return theme.colors.textSecondary;
            case 'tertiary':
                return theme.colors.textTertiary;
            default:
                return theme.colors.textPrimary;
        }
    }, [color, theme]);
    const defaultStyle = theme.textVariants[variant] || {};
    return (
        <NativeText
            {...props}
            style={[defaultStyle, color && {color: textColor}, weight && {fontFamily: `Font-${weight}`}, style]}
        />
    );
};
export default Text;
