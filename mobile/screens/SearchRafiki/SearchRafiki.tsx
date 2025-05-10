import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AllStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

const SearchRafiki = ({navigation, route}: AllStackScreenProps<'SearchRafiki'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [searchText, setSearchText] = useState('');

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Search Username',
            headerSearchBarOptions: {
                hideWhenScrolling: true,
                inputType: 'text',
                onChangeText: e => console.log(e),
            },
        });
    }, [navigation.setOptions, theme.colors.textPrimary]);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <Text>Search SearchRafiki</Text>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        container: {
            flex: 1,
        },
    });

export default SearchRafiki;
