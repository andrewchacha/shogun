import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {StyleSheet} from 'react-native';
import {FontAwesome6} from '@expo/vector-icons';
import {AppTheme} from '@/utils/styles';
import PlusItem from '@/screens/ChatRoom/plusComponents/shared';

export function PlusPhotos() {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const them = useAppTheme();

    return (
        <PlusItem onPress={() => {}}>
            <PlusItem.Icon IconLib={FontAwesome6} name="photo-film" />
            <PlusItem.Title title="Photos" />
        </PlusItem>
    );
}

const dynamicStyles = (theme: AppTheme) => StyleSheet.create({});
