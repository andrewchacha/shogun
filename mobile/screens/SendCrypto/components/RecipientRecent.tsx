import {ScrollView, StyleSheet, View} from 'react-native';
import {Recipient} from '@/screens/SendCrypto/components/Recipient';
import React, {useMemo} from 'react';
import {getRecentStore} from '@/storage/recentStore';
import {Chain} from '@/chains/chain';
import {useUserSearchAddresses} from '@/hooks/api/useUserSearch';
import {SendCryptoRecipient} from '@/navigation/types';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';

type Props = {
    onRecipient: (r: SendCryptoRecipient) => void;
    chain: Chain;
    filterAddress?: string;
};

export function RecipientRecent({onRecipient, chain, filterAddress}: Props) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const recent = useMemo(() => {
        const store = getRecentStore();
        return store.getRecentForChain(chain);
    }, [chain]);

    const recentAddresses = recent.map(r => r.address);
    const {data, isLoading} = useUserSearchAddresses(recentAddresses, chain);

    const mergedData = useMemo(() => {
        if (!recent || !data?.data) return [];

        return recent.map(r => {
            const elapsed = timeAgo(Date.now() - new Date(r.date).getTime());
            const other = data?.data?.find(d => d.address === r.address);
            return {
                ...r,
                time: elapsed,
                username: other?.username || '',
                thumbnail: other?.thumbnail || {uri: ''},
            };
        });
    }, [data?.data, recent]);

    return (
        <View style={styles.container}>
            <Text variant={'subheader'} style={styles.head}>
                Recent
            </Text>
            <Text style={styles.info}>Recent addresses you sent crypto to from this device.</Text>
            <ScrollView
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                horizontal={true}
                contentContainerStyle={styles.scrollViewContent}>
                {mergedData.map(recipient => {
                    if (filterAddress && recipient.address === filterAddress) return null;
                    return (
                        <Recipient
                            key={recipient.address}
                            thumbnail={recipient.thumbnail.uri}
                            address={recipient.address}
                            time={recipient.time}
                            username={recipient.username}
                            onPress={() => {
                                onRecipient({
                                    address: recipient.address,
                                    username: recipient.username,
                                    chain: chain,
                                    thumbnail: recipient.thumbnail.uri,
                                });
                            }}
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
}

function timeAgo(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months} months ago`;
    if (days > 0) return `${days} days ago`;
    if (hours > 0) return `${hours} hr ago`;
    if (minutes > 0) return `${minutes} m ago`;
    return `${seconds} s ago`;
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {},
        head: {},
        info: {
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
        scrollView: {
            marginHorizontal: -spacing.th,
            marginTop: spacing.s,
        },
        scrollViewContent: {
            paddingHorizontal: spacing.m,
            gap: spacing.m,
        },
    });
