import {rounded, spacing} from '@/utils/styles';
import React, {useState} from 'react';

import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {type StyleProp, StyleSheet, TouchableOpacity, View, type ViewStyle} from 'react-native';

export interface Props {
    items: {key: string; label: string}[];
    containerStyle?: StyleProp<ViewStyle>;
    value?: string;
    onSelect: (key: string) => void;
    horizontal?: boolean;
}

const RadioGroup = ({items, containerStyle, value, horizontal, onSelect}: Props) => {
    const [selected, setSelected] = useState<string>(value || '');

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <View
            style={[
                styles.container,
                containerStyle,
                horizontal && {flexDirection: 'row', alignItems: 'center', gap: spacing.m},
            ]}>
            {items.map(item => {
                const isActive = item.key === selected;
                return (
                    <TouchableOpacity
                        style={styles.item}
                        key={item.key}
                        onPress={() => {
                            setSelected(item.key);
                            onSelect(item.key);
                        }}>
                        <View style={[styles.circle, isActive && styles.circleActive]}>
                            {isActive && <View style={styles.innerCircle} />}
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {},
        circle: {
            borderColor: theme.colors.textPrimary,
            borderRadius: rounded.full,
            marginRight: spacing.m,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            height: 24,
            width: 24,
        },
        circleActive: {
            borderColor: theme.colors.secondary,
        },
        innerCircle: {
            backgroundColor: theme.colors.secondary,
            borderRadius: rounded.full,
            height: 16,
            width: 16,
        },
        item: {
            flexDirection: 'row',
            marginTop: spacing.m,
            alignItems: 'center',
        },
        label: {},
    });

export default RadioGroup;
