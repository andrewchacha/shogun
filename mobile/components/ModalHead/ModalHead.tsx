import Text from '@/components/Text/Text';
import {Feather, FontAwesome, FontAwesome5, Fontisto, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {type AppTheme, rounded, spacing} from '@/utils/styles';
import React, {useMemo} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';

interface Props {
    title: string;
    onClose: () => void;
}

const ModalHead = ({title, onClose}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    return (
        <View style={styles.container}>
            <Text weight={'600'} style={styles.title}>
                {title}
            </Text>
            <TouchableOpacity
                onPress={onClose}
                hitSlop={{top: -5, left: -5, right: -5, bottom: -5}}
                style={styles.closeContainer}>
                <MaterialIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: spacing.th,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        title: {
            fontSize: 16,
            color: theme.colors.textPrimary,
        },
        closeContainer: {
            backgroundColor: theme.isDark ? theme.colors.cardBackground : '#EAEAEA',
            borderRadius: rounded.full,
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
        },
        closeIcon: {
            color: theme.colors.textSecondary,
            fontSize: 20,
        },
    });
export default ModalHead;
