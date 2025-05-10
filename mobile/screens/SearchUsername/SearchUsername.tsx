import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AllStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';
import {spacing} from '@/utils/styles';
import TextInput from '@/components/TextInput/TextInput';
import {Feather} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import Loading from '@/components/Loading/Loading';
import {SearchUser} from '@/components/SearchUser/SearchUser';
import Separator from '@/components/Separator/Separator';
import {apiUserSearchUsername, SearchUsernameResponse} from '@/utils/api/userSearch';
import {ApiStatus} from '@/utils/types/api';
import {atom, useSetAtom} from 'jotai';

export const searchUsernameAtom = atom<{[key: string]: SearchUsernameResponse}>({});
const SearchUsername = ({navigation, route}: AllStackScreenProps<'SearchUsername'>) => {
    const {searchId} = route.params;
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [foundUser, setFoundUser] = useState<SearchUsernameResponse | undefined>(undefined);
    const setUsernameRes = useSetAtom(searchUsernameAtom);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Search Username',
        });
    }, [navigation.setOptions, theme]);

    const onSearch = async () => {
        if (searchText.length === 0) {
            return;
        }
        setFoundUser(undefined);
        setIsLoading(true);
        try {
            const res = await apiUserSearchUsername(searchText);
            setIsLoading(false);
            if (res.status !== ApiStatus.Success) {
                return;
            }
            setFoundUser(res.data);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    const onSelectUser = (user: SearchUsernameResponse) => {
        navigation.goBack();
        if (searchId) {
            setUsernameRes(curr => ({...curr, [searchId]: user}));
        }
    };

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView
                contentInsetAdjustmentBehavior={'automatic'}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}>
                <TextInput
                    placeholder={'Enter Username'}
                    returnKeyType={'search'}
                    value={searchText}
                    onChangeText={setSearchText}
                    onSubmitEditing={() => onSearch()}
                    leftChildren={<Feather name="search" style={styles.searchIcon} />}
                    rightChildren={
                        searchText.length > 0 && (
                            <Pressable
                                style={styles.searchRight}
                                onPress={() => {
                                    setFoundUser(undefined);
                                    setSearchText('');
                                    setIsLoading(false);
                                }}>
                                <Feather name="x" style={styles.clearIcon} />
                            </Pressable>
                        )
                    }
                />
                <Loading isLoading={isLoading} style={styles.loadingWrap} />
                <Separator space={spacing.m} />
                {foundUser && (
                    <SearchUser
                        onPress={() => onSelectUser(foundUser)}
                        key={foundUser.id}
                        id={foundUser.id}
                        username={foundUser.username}
                        name={foundUser.name}
                        thumbnail={foundUser.thumbnail}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            marginHorizontal: spacing.th,
        },
        searchRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
        },
        searchIcon: {
            color: theme.colors.textPrimary,
            fontSize: 20,
            paddingHorizontal: spacing.xs,
        },
        clearIcon: {
            color: theme.colors.textPrimary,
            fontSize: 20,
            paddingHorizontal: spacing.xs,
        },
        loadingWrap: {
            alignSelf: 'center',
            marginVertical: spacing.xl,
        },
    });

export default SearchUsername;
