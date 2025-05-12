import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useRef} from 'react';
import {RefreshControl, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {rounded, spacing} from '@/utils/styles';
import Separator from '@/components/Separator/Separator';
import {Entypo, FontAwesome5, FontAwesome6, Ionicons, MaterialIcons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {useScrollToTop} from '@react-navigation/native';
import {ItemReset} from '@/screens/Settings/components/ItemReset';
import {sectionItemStyle} from '@/screens/Settings/components/shared';
import {ItemAppTheme} from '@/screens/Settings/components/ItemAppTheme';
import {useMe} from '@/hooks/api/useMe';
import Image from '@/components/Image/Image';

const Settings = ({navigation}: CommonStackScreenProps<'Settings'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const itemsStyle = useThemeStyleSheetProvided(theme, sectionItemStyle);
    const scrollViewRef = useRef<ScrollView>(null);
    useScrollToTop(scrollViewRef);

    const {data, isLoading, refetch} = useMe(true);
    const me = data?.data;
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView
                ref={scrollViewRef}
                refreshControl={<RefreshControl onRefresh={refetch} refreshing={isLoading} />}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <Pressable
                    style={styles.manageWrap}
                    onPress={() => {
                        navigation.navigate('SettingsAccount');
                    }}>
                    <Image uri={me?.thumbnail?.uri} blurHash={me?.thumbnail?.blurhash} style={styles.thumbnail} />
                    <View>
                        <Text style={styles.manageTitle}>Manage Account</Text>
                        <Text style={styles.manageInfo}>Private key, recovery phrase and more.</Text>
                    </View>
                </Pressable>
                <Separator space={spacing.l} />
                <View style={styles.section}>
                    {/*<Pressable*/}
                    {/*    style={itemsStyle.sectionRow}*/}
                    {/*    onPress={() => {*/}
                    {/*        navigation.navigate('AddressBook');*/}
                    {/*    }}>*/}
                    {/*    <FontAwesome5 name="address-book" style={[itemsStyle.sectionIcon]} />*/}
                    {/*    <Text style={itemsStyle.sectionLabel}>Address Book</Text>*/}
                    {/*</Pressable>*/}
                    <Pressable
                        style={itemsStyle.sectionRow}
                        onPress={() => {
                            navigation.navigate('Privacy');
                        }}>
                        <Entypo name="lock" style={[itemsStyle.sectionIcon]} />
                        <Text style={itemsStyle.sectionLabel}>Security & Privacy</Text>
                    </Pressable>
                    <Pressable style={itemsStyle.sectionRow}>
                        <Ionicons name="notifications" style={[itemsStyle.sectionIcon]} />
                        <Text style={itemsStyle.sectionLabel}>Notifications</Text>
                    </Pressable>
                    <Pressable style={itemsStyle.sectionRow}>
                        <FontAwesome6 name="money-bills" style={[itemsStyle.sectionIcon]} />
                        <Text style={itemsStyle.sectionLabel}>Display Currency</Text>
                        <Text style={itemsStyle.sectionValue}>USD</Text>
                    </Pressable>
                </View>

                <Separator space={spacing.l} />
                <View style={styles.section}>
                    <ItemAppTheme />
                    <Pressable style={itemsStyle.sectionRow}>
                        <MaterialIcons name="live-help" style={itemsStyle.sectionIcon} />
                        <Text style={itemsStyle.sectionLabel}>Help</Text>
                    </Pressable>
                    <ItemReset />
                </View>
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
        manageWrap: {
            backgroundColor: theme.colors.secondary + '20',
            borderRadius: rounded.l,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
        },
        thumbnail: {
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: spacing.m,
        },
        manageTitle: {
            fontFamily: 'Font-600',
        },
        manageInfo: {
            color: theme.colors.textSecondary,
            fontSize: 14,
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

export default Settings;
