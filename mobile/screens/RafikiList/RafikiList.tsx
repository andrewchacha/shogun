import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import React, {useLayoutEffect} from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Pressable from '@/components/Button/Pressable';

const RafikiList = ({navigation}: CommonStackScreenProps<'RafikiList'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Rafiki',
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text>Hello Rafiki</Text>
        </ScrollView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.th,
            paddingVertical: spacing.th,
            paddingBottom: spacing.xxl,
        },
    });

export default RafikiList;
