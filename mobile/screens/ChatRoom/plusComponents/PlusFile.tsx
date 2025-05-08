import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {StyleSheet} from 'react-native';
import {FontAwesome6} from '@expo/vector-icons';
import {AppTheme} from '@/utils/styles';
import PlusItem from '@/screens/ChatRoom/plusComponents/shared';

export function PlusFile() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <PlusItem onPress={() => {}}>
            <PlusItem.Icon IconLib={FontAwesome6} name="file-alt" />
            <PlusItem.Title title="File" />
        </PlusItem>
    );
}

const dynamicStyles = (theme: AppTheme) => StyleSheet.create({});
