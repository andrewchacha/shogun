import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import React, {useLayoutEffect} from 'react';
import {StyleSheet, View, ScrollView, Switch} from 'react-native';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import Pressable from '@/components/Button/Pressable';
import {ItemLockMethod} from '@/screens/Privacy/components/ItemLockMethod';
import {ItemAutomaticLock} from '@/screens/Privacy/components/ItemAutomaticLock';
import {ItemSwitch, SwitchProps} from '@/screens/Privacy/components/ItemSwitch';
import {FontAwesome5} from '@expo/vector-icons';
import DataLocal from '@/components/DataLocal/dataLocal';

const ShowItems: SwitchProps[] = [
    {
        title: 'Show Online Status',
        info: 'See and other users can see when you are online',
        value: true,
    },
    {
        title: 'Show Read Receipt',
        info: 'See and other users can see when you read their messages',
        value: true,
    },
    {
        title: 'Show Typing Indicator',
        info: 'See and other users can see when you are replying to their message',
        value: true,
    },
    {
        title: 'Show Last Seen',
        info: 'See and other users can see when you were last seen',
        value: true,
    },
];

const Privacy = ({navigation}: CommonStackScreenProps<'Privacy'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Security & Privacy',
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.subheadWrap}>
                <Text style={styles.subhead}>App Lock</Text>
                <DataLocal loc={'local'} />
            </View>
            <View style={styles.section}>
                <ItemLockMethod />
                <ItemAutomaticLock />
            </View>

            <View style={styles.subheadWrap}>
                <Text style={styles.subhead}>Chat</Text>
                <DataLocal loc={'cloud'} />
            </View>
            <View style={styles.section}>
                {ShowItems.map((item, index) => (
                    <ItemSwitch key={index} {...item} />
                ))}
            </View>
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
        section: {
            marginBottom: spacing.th,
            borderRadius: rounded.l,
            ...theme.cardVariants.simple,
        },
        subheadWrap: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: spacing.m,
        },
        subhead: {
            fontFamily: 'Font-600',
        },
    });

export default Privacy;
