import {Feather, FontAwesome} from '@expo/vector-icons';
import {useThemeStyleSheet} from '@/hooks/utility/useThemeStyleSheet';
import {type AppTheme, rounded} from '@/utils/styles';
import React, {useEffect, useState} from 'react';
import {StyleSheet, type TextStyle, TouchableOpacity, View, type ViewStyle} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring} from 'react-native-reanimated';

interface Props {
    value: boolean;
    onValueChange: (newValue: boolean) => void;
    containerStyle?: ViewStyle;
    innerStyle?: TextStyle;
}
const Checkbox = ({value, onValueChange, containerStyle, innerStyle}: Props) => {
    const scale = useSharedValue(1);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{scale: scale.value}],
        };
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        scale.value = withSpring(
            1.2,
            {
                damping: 1000,
                stiffness: 1000,
            },
            () => {
                scale.value = withSpring(1);
            },
        );
    }, [value]);

    const handlePress = () => {
        if (onValueChange) onValueChange(!value);
    };

    const styles = useThemeStyleSheet(dynamicStyles);

    return (
        <TouchableOpacity onPress={handlePress}>
            <Animated.View style={[styles.checkbox, animatedStyles, containerStyle]}>
                {value && <FontAwesome name="check" style={[styles.innerCheckbox, innerStyle]} />}
            </Animated.View>
        </TouchableOpacity>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        checkbox: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderWidth: 2,
            borderColor: theme.colors.textSecondary,
            borderRadius: rounded.s,
        },
        innerCheckbox: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
    });

export default Checkbox;
