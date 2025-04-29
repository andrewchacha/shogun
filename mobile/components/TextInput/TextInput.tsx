import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {type AppTheme, hitSlop, rounded, spacing} from '@/utils/styles';
import React, {useState} from 'react';
import {
    type NativeSyntheticEvent,
    TextInput as NativeTextInput,
    type StyleProp,
    StyleSheet,
    type TextInputFocusEventData,
    type TextInputProps,
    type TextStyle,
    View,
    type ViewStyle,
} from 'react-native';

interface Props extends TextInputProps {
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    isError?: boolean;
    leftChildren?: React.ReactNode;
    rightChildren?: React.ReactNode;
}

const TextInput = (props: Props, ref: any) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [isFocused, setIsFocused] = useState(false);

    const onFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (props.onFocus) {
            props.onFocus(e);
        }
        setIsFocused(true);
    };
    const onBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (props.onBlur) {
            props.onBlur(e);
        }
        setIsFocused(false);
    };

    return (
        <View
            style={[
                styles.container,
                isFocused ? styles.focusedContainer : {},
                props.isError ? styles.errorContainer : {},
                props.containerStyle,
            ]}>
            {props.leftChildren}
            <NativeTextInput
                hitSlop={hitSlop}
                ref={ref}
                {...props}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholderTextColor={theme.colors.textTertiary}
                style={[styles.text, props.textStyle]}
            />
            {props.rightChildren}
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.simple,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: rounded.xl,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.m,
            borderWidth: StyleSheet.hairlineWidth,
            gap: 4,
        },
        focusedContainer: {
            borderWidth: 1,
            borderColor: theme.colors.textSecondary,
        },
        errorContainer: {
            borderWidth: 1,
            borderColor: theme.colors.warning,
        },
        text: {
            ...theme.textVariants.body,
            color: theme.colors.textPrimary,
            padding: spacing.xs,
            flex: 1,
        },
    });
export default React.forwardRef(TextInput);
