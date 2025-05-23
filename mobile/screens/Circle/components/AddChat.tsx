import {AppTheme, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AntDesign} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export function AddChat() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, {bottom: insets.bottom, right: insets.right}]}>
            <AntDesign name="plus" size={24} color={theme.colors.textPrimaryInvert} />
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            position: 'absolute',
            backgroundColor: theme.colors.primary,
            bottom: 0,
            right: 0,
            width: 50,
            height: 50,
            borderRadius: rounded.full,
            justifyContent: 'center',
            alignItems: 'center',
            margin: spacing.m,
            boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.25)',
        },
    });
