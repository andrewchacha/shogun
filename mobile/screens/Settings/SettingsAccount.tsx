import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {palette, rounded, spacing} from '@/utils/styles';
import {useScrollToTop} from '@react-navigation/native';
import {useMe} from '@/hooks/api/useMe';
import {Feather, FontAwesome5} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';
import Image from '@/components/Image/Image';
import {getAccountStore} from '@/storage/accountStore';

const Settings = ({navigation}: CommonStackScreenProps<'SettingsAccount'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Manage Account',
        });
    }, []);

    const currentAccountID = useCurrentAccountID();
    const account = useMemo(() => {
        if (!currentAccountID) {
            return null;
        }
        const store = getAccountStore();
        return store.getAccountByID(currentAccountID);
    }, [currentAccountID]);

    const {data} = useMe(true);
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef);

    const me = data?.data;

    const {isLoading, refetch} = useMe(false);
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView
                ref={scrollViewRef}
                refreshControl={<RefreshControl onRefresh={refetch} refreshing={isLoading} />}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.upperWrap}>
                    <Image uri={me?.thumbnail?.uri} style={styles.avatar} />
                    <View style={styles.upperInner}>
                        <Text style={styles.username}>@{me?.username}</Text>
                        <Text style={styles.name}>{me?.name}</Text>
                    </View>
                    <Text style={styles.index}>/{account?.path_index}/</Text>
                </View>
                <Pressable
                    style={styles.listItem}
                    onPress={() => {
                        navigation.navigate('WalletRecovery');
                    }}>
                    <Text style={styles.listTitle}>Recovery phrase</Text>
                    <Feather name="chevron-right" style={styles.chevron} />
                </Pressable>
                <Pressable style={styles.listItem}>
                    <Text style={styles.listTitle}>Show Private Key</Text>
                    <Feather name="chevron-right" style={styles.chevron} />
                </Pressable>
                <Pressable style={styles.listItem}>
                    <Text style={styles.listTitle}>Delete Account</Text>
                    <Feather name="chevron-right" style={styles.chevron} />
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollContent: {
            marginVertical: spacing.th,
            marginHorizontal: spacing.th,
        },
        upperWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.l,
        },
        upperInner: {
            flex: 1,
        },
        avatar: {
            borderRadius: rounded.full,
            marginRight: spacing.l,
            height: 80,
            width: 80,
        },
        username: {
            fontFamily: 'Font-600',
            fontSize: 16,
        },
        name: {
            color: theme.colors.textSecondary,
            fontSize: 16,
        },
        index: {
            color: theme.colors.textTertiary,
        },
        listItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 20,
        },
        listTitle: {
            fontFamily: 'Font-600',
            fontSize: 16,
            flex: 1,
        },
        chevron: {
            color: theme.colors.textPrimary,
            fontSize: 20,
        },
    });

export default Settings;
