import Loading from '@/components/Loading/Loading';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import type React from 'react';
import {Platform, Pressable, type StyleProp, StyleSheet, View, type ViewStyle} from 'react-native';
import {isTablet} from 'react-native-device-info';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props {
    variant?: Variant;
    title: string;
    onPress: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    disabled?: boolean;
    isLoading?: boolean;
    iconRight?: React.ReactNode;
}

const Button: React.FC<Props> = ({
    title,
    variant = 'primary',
    onPress,
    containerStyle,
    isLoading = false,
    disabled = false,
    iconRight,
}) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const handlePress = () => {
        if (disabled || isLoading) {
            return;
        }
        onPress();
    };

    return (
        <Pressable
            onPress={handlePress}
            style={({pressed}) => [
                styles.container,
                isTablet() && styles.containerTablet,
                {opacity: Platform.OS !== 'android' && pressed ? 0.3 : 1},
                theme.buttonVariants[variant],
                containerStyle,
                disabled && {opacity: 0.3},
                pressed &&
                    variant === 'secondary' && {
                        backgroundColor: theme.buttonVariants[variant].faintBackColor,
                    },
            ]}
            android_ripple={{color: 'light-grey'}}>
            <View style={styles.loadingContainer}>
                <Loading isLoading={isLoading} color={theme.buttonTextVariants[variant].color || 'white'} />
            </View>
            <Text weight="500" style={[theme.buttonTextVariants[variant], styles.text]}>
                {title}
            </Text>
            <View style={styles.rightContainer}>{iconRight}</View>
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            borderRadius: rounded.xl,
            alignItems: 'center',
            padding: 16,
        },
        loadingContainer: {
            position: 'absolute',
            left: spacing.s,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        rightContainer: {
            position: 'absolute',
            right: spacing.s,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        },
        text: {
            textAlign: 'center',
        },
        containerTablet: {
            width: 300,
            alignSelf: 'center',
        },
    });

export default Button;
