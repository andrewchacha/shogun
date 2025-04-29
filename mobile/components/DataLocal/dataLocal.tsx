import {StyleSheet, View} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {Fontisto, Octicons} from '@expo/vector-icons';
import {AppTheme} from '@/utils/styles';
import Pressable from '@/components/Button/Pressable';
import {ToastController} from '@/components/Toast/Toast';

type Props = {
    loc: 'local' | 'cloud';
};
export default function DataLocal({loc}: Props) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onPress = () => {
        const message = loc === 'local' ? 'This data is only stored locally.' : 'This data is stored in the cloud.';
        ToastController.show({
            content: message,
            kind: 'info',
        });
    };

    return (
        <Pressable style={styles.container} onPress={onPress}>
            {loc === 'local' && <Octicons name="device-mobile" style={styles.icon} />}
            {loc === 'cloud' && <Fontisto name="cloudy" style={styles.icon} />}
        </Pressable>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {},
        icon: {
            color: theme.colors.textTertiary,
            fontSize: 12,
        },
    });
