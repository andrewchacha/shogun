import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useRef} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {hitSlop, rounded, spacing} from '@/utils/styles';
import Separator from '@/components/Separator/Separator';
import {Ionicons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {MyAddresses} from '@/screens/Main/MyProfile/components/MyAddresses';
import {useScrollToTop} from '@react-navigation/native';
import {ProfileJumbo} from '@/screens/Main/MyProfile/components/ProfileJumbo';
import {useMe} from '@/hooks/api/useMe';
import {useCurrentKeys} from '@/storage/accountStoreHooks';
import {WalletCard} from '@/screens/Main/MyProfile/components/WalletCard';
import {WalletValue} from '@/screens/Settings/components/WalletValue';
import {Chain} from '@/chains/chain';

const MyProfile = ({}: CommonStackScreenProps<'MyProfile'>) => {
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef);

    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {isLoading, refetch} = useMe(false);
    const {result: keys} = useCurrentKeys();

    if (!keys) return null;
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView
                ref={scrollViewRef}
                refreshControl={<RefreshControl onRefresh={refetch} refreshing={isLoading} />}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <ProfileJumbo />
                <Separator space={spacing.l} />
                <View style={styles.subheaderWrap}>
                    <Text style={styles.subtitle}>My Addresses</Text>
                    <Pressable hitSlop={hitSlop}>
                        <Ionicons name="cog" style={styles.settingsIcon} />
                    </Pressable>
                </View>
                <Separator space={spacing.s} />
                <MyAddresses />
                <Separator space={spacing.l} />
                <WalletValue />
                {keys.map(accountKey => {
                    if (accountKey.chain === Chain.Solana) {
                        return null;
                    }
                    return (
                        <WalletCard key={accountKey.address} chain={accountKey.chain} address={accountKey.address} />
                    );
                })}
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
            marginHorizontal: spacing.th,
            paddingVertical: spacing.th,
            marginBottom: spacing.xl,
        },
        subtitle: {
            fontSize: 16,
            fontFamily: 'Font-600',
            marginTop: spacing.m,
        },
        section: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
        },
        subheaderWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        settingsIcon: {
            fontSize: 22,
            color: theme.colors.textSecondary,
        },
    });

export default MyProfile;
