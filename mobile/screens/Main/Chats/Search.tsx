import {AppTheme, rounded, spacing} from '@/utils/styles';
import {View, StyleSheet} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AntDesign} from '@expo/vector-icons';
import TextInput from '@/components/TextInput/TextInput';

export function Search() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <View>
            <TextInput placeholder={'Search'} leftChildren={<AntDesign name="search1" style={styles.searchIcon} />} />
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.m,
            gap: spacing.m,
        },
        searchIcon: {
            color: theme.colors.textSecondary,
            fontSize: 24,
        },
    });
