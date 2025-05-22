import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import Separator from '@/components/Separator/Separator';
import {spacing} from '@/utils/styles';
import {LegendList} from '@legendapp/list';
import {CircleCard} from './components/CircleCard';
import {Search} from './components/Search';

const CIRCLES = [
    {
        id: '1',
        name: 'Walrus Builders',
        coverPhoto: 'https://cdn.midjourney.com/bd07da2b-aa56-4891-aca9-9bccf38d1d2f/0_2.png',
        memberCount: 694,
        tokenRequirement: {
            coinSymbol: 'WAL',
            amount: 100,
        },
        isVerified: true,
        category: 'DeFi',
        isJoined: false,
    },
    {
        id: '2',
        name: 'Crypto Artists',
        coverPhoto: 'https://cdn.midjourney.com/b7a7d22b-2e41-4191-b301-bb43420eedae/0_0.png',
        memberCount: 53,
        tokenRequirement: {
            coinSymbol: 'SUI',
            amount: 2.5,
        },
        isVerified: true,
        category: 'Development',
        isJoined: true,
    },
    {
        id: '3',
        name: 'Degens',
        coverPhoto: 'https://cdn.midjourney.com/b3f035c1-6fcf-46e8-bcc3-14388d1e9048/0_0.png',
        memberCount: 532,
        isVerified: false,
        category: 'DEGEN',
        isJoined: false,
    },
    {
        id: '4',
        name: 'DeFi Yield Farmers',
        coverPhoto: 'https://cdn.midjourney.com/22eacb26-f8fb-402e-a793-c89de4346dad/0_2.png',
        memberCount: 3240,
        tokenRequirement: {
            coinSymbol: 'FARM',
            amount: 100,
        },
        isVerified: true,
        category: 'DeFi',
        isJoined: true,
    },
];

const Discover = ({navigation}: CommonStackScreenProps<'Discover'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <LegendList
                data={CIRCLES}
                contentContainerStyle={styles.list}
                estimatedItemSize={100}
                keyExtractor={item => item.id}
                ItemSeparatorComponent={() => <Separator space={spacing.l} />}
                ListHeaderComponent={
                    <>
                        <Text variant={'header'}>Circles</Text>
                        <Search onSearch={() => {}} onFilterPress={() => {}} />
                        <Separator space={spacing.l} />
                    </>
                }
                renderItem={({item}) => <CircleCard {...item} />}
            />
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
            justifyContent: 'center',
            alignItems: 'center',
        },
        list: {
            paddingHorizontal: spacing.th,
            paddingVertical: spacing.l,
        },
        animation: {
            width: 100,
            height: 100,
        },
        cooking: {
            color: theme.colors.secondary,
            fontFamily: 'Font-400',
            textAlign: 'center',
        },
    });

export default Discover;
