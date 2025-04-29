import {rounded, spacing} from '@/utils/styles';
import type React from 'react';

import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {type StyleProp, StyleSheet, type TextStyle, type ViewStyle} from 'react-native';
import Pressable from '@/components/Button/Pressable';

interface Props {
    title: string;
    onPress?: () => void;
    icon?: any;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const Tag: React.FC<Props> = ({title, icon, onPress, containerStyle, textStyle}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <Pressable style={[styles.container, containerStyle]} onPress={onPress}>
            <Text variant="small" style={textStyle}>
                {title}
            </Text>
            {icon}
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.m,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.s,
            gap: spacing.s,
        },
    });

export default Tag;
