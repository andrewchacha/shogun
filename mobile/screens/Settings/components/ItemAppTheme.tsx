import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import React, {forwardRef, ReactNode, useRef} from 'react';
import {MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {sectionItemStyle} from '@/screens/Settings/components/shared';
import {useCallback, useMemo} from 'react';
import {View, StyleSheet, TextStyle} from 'react-native';
import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import ModalHead from '@/components/ModalHead/ModalHead';
import {DisplayTheme} from '@/utils/types';
import {useAppColorSchemeChanger} from '@/hooks/utility/useAppColorScheme';

export const ItemAppTheme = () => {
    const {colorScheme} = useAppColorSchemeChanger();
    const theme = useAppTheme();
    const itemsStyle = useThemeStyleSheetProvided(theme, sectionItemStyle);
    const themeModalRef = useRef<BottomSheetModal>(null);

    const openThemeModal = useCallback(() => {
        themeModalRef.current?.present();
    }, []);

    return (
        <>
            <Pressable style={itemsStyle.sectionRow} onPress={openThemeModal}>
                <MaterialCommunityIcons name="theme-light-dark" style={itemsStyle.sectionIcon} />
                <Text style={itemsStyle.sectionLabel}>App Theme</Text>
                <Text style={[itemsStyle.sectionValue, {textTransform: 'capitalize'}]}>{colorScheme}</Text>
            </Pressable>
            <ThemeModal ref={themeModalRef} />
        </>
    );
};

type Props = {};

const options: {label: string; value: DisplayTheme; icon: (style: TextStyle) => ReactNode}[] = [
    {
        label: 'System',
        value: 'system',
        icon: (style: TextStyle) => <MaterialCommunityIcons name="theme-light-dark" style={style} />,
    },
    {
        label: 'Light',
        value: 'light',
        icon: (style: TextStyle) => <MaterialCommunityIcons name="lightbulb-on-outline" style={style} />,
    },
    {
        label: 'Dark',
        value: 'dark',
        icon: (style: TextStyle) => <MaterialIcons name="dark-mode" style={style} />,
    },
];

const ThemeModal = forwardRef((props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const {colorScheme, setColorScheme} = useAppColorSchemeChanger();
    const snapPoints = useMemo(() => [230], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.75} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onClose = () => ref.current?.close();

    return (
        <BottomSheetModal
            enablePanDownToClose
            backgroundStyle={styles.container}
            handleIndicatorStyle={styles.indicator}
            ref={ref}
            onChange={handleSheetPositionChange}
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}>
            <ModalHead title={'App Theme'} onClose={onClose} />
            <View style={styles.wrapper}>
                {options.map(option => (
                    <Pressable
                        key={option.value}
                        style={[styles.item, colorScheme === option.value && styles.itemSelected]}
                        onPress={() => {
                            setColorScheme(option.value);
                        }}>
                        {option.icon(styles.icon)}
                        <Text style={styles.label}>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </BottomSheetModal>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.modalBackground,
        },
        indicator: {
            backgroundColor: theme.colors.modalIndicator,
        },
        wrapper: {
            alignItems: 'center',
            flexDirection: 'row',
            padding: spacing.m,
            gap: spacing.m,
        },
        item: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.xl,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.m,
            gap: spacing.m,
            height: 100,
            flex: 1,
        },
        itemSelected: {
            borderWidth: 3,
            borderColor: theme.colors.textPrimary,
        },
        label: {
            fontFamily: 'Font-500',
            fontSize: 16,
        },
        icon: {
            fontSize: 24,
            color: theme.colors.textPrimary,
        },
    });
