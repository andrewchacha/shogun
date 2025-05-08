import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {StyleSheet} from 'react-native';
import {FontAwesome5} from '@expo/vector-icons';
import {AppTheme} from '@/utils/styles';
import PlusItem from '@/screens/ChatRoom/plusComponents/shared';

export function PlusCamera() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <PlusItem onPress={() => {}}>
            <PlusItem.Icon IconLib={FontAwesome5} name="camera" />
            <PlusItem.Title title="Camera" />
        </PlusItem>
    );
}

const dynamicStyles = (theme: AppTheme) => StyleSheet.create({});
