import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {RefreshControl, SafeAreaView, StyleSheet} from 'react-native';
import {spacing} from '@/utils/styles';
import {useWalletAssets} from '@/hooks/wallets/useWalletAssets';
import {capitalizeFirstLetter} from '@/utils/helper/formatter';
import {FlashList} from '@shopify/flash-list';
import {ListItemHeader, ListKind, listKindAtom} from '@/screens/TokenList/components/ListItemHeader';
import Separator from '@/components/Separator/Separator';
import {useAtom} from 'jotai';
import {useWalletHistory} from '@/hooks/wallets/useWalletHistory';
import {WalletAsset} from '@/utils/api/walletAssets';
import {WalletTransaction} from '@/utils/api/walletTransaction';
import {DateLayout, formatDate} from '@/utils/helper/date';
import {StickyItem, StickyTitle} from '@/screens/TokenList/components/StikyTitle';
import Loading from '@/components/Loading/Loading';
import TransactionItem from '@/screens/TokenList/components/TransactionItem';
import TokenItem from '@/screens/TokenList/components/TokenItem';

const isWalletAsset = (item: WalletAsset | WalletTxSticky): item is WalletAsset => 'address' in item;
const isStickyItem = (item: WalletTxSticky): item is StickyItem => item.type === 'sticky';
const isWalletTransaction = (item: WalletAsset | WalletTxSticky): item is WalletTransaction => 'signature' in item;

type WalletTxSticky = WalletTransaction | StickyItem;
type ListData = WalletAsset[] | WalletTxSticky[];

const TokenList = ({navigation, route}: CommonStackScreenProps<'TokenList'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {address, chain} = route.params;
    const [listKind, setListKind] = useAtom(listKindAtom);

    const {
        data: tokenData,
        isLoading: isLoadingToken,
        refetch: refetchToken,
    } = useWalletAssets(address, chain, listKind === ListKind.Token);

    const {
        data: historyData,
        isLoading: isLoadingHistory,
        refetch: refetchHistory,
    } = useWalletHistory(address, chain, listKind === ListKind.History);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: `${capitalizeFirstLetter(chain)} Wallet`,
            headerTitleAlign: 'center',
        });
        return () => {
            setListKind(ListKind.Token);
        };
    }, []);

    const {data, sticky}: {data: ListData; sticky: number[]} = useMemo(() => {
        if (listKind === ListKind.Token) {
            return {data: tokenData?.data?.tokens || [], sticky: []};
        }
        if (listKind === ListKind.History) {
            const groupedData: (WalletTransaction | StickyItem)[] = [];
            const stickyIndices: number[] = [];
            let prevDate = '';
            historyData?.data?.forEach(tx => {
                const date = formatDate(tx.timestamp, DateLayout.DayNumeric);
                if (date !== prevDate) {
                    groupedData.push({type: 'sticky', label: date, timestamp: tx.timestamp});
                    stickyIndices.push(groupedData.length - 1);
                }
                prevDate = date;
                groupedData.push(tx);
            });
            return {data: groupedData, sticky: stickyIndices};
        }
        return {data: [], sticky: []};
    }, [listKind, tokenData, historyData]);

    const onRefresh = useCallback(() => {
        if (listKind === ListKind.Token) {
            void refetchToken();
        }
        if (listKind === ListKind.History) {
            void refetchHistory();
        }
    }, [listKind]);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <FlashList
                refreshControl={
                    <RefreshControl refreshing={isLoadingToken || isLoadingHistory} onRefresh={onRefresh} />
                }
                data={data}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.contentContainer}
                estimatedItemSize={100}
                renderItem={({
                    item,
                    target,
                }: {
                    item: WalletAsset | WalletTxSticky;
                    target: 'Cell' | 'Measurement' | 'StickyHeader';
                }) => {
                    if (isWalletAsset(item)) return <TokenItem {...item} />;
                    if (isStickyItem(item)) {
                        if (target === 'StickyHeader') {
                            return <StickyTitle {...item} isSticky={true} />;
                        }
                        return <StickyTitle {...item} />;
                    }
                    return <TransactionItem {...item} myAddress={address} chain={chain} />;
                }}
                stickyHeaderIndices={sticky}
                getItemType={(item: WalletAsset | WalletTxSticky) => {
                    if (isWalletAsset(item)) return 'token';
                    if (isStickyItem(item)) return 'sticky';
                    return 'transaction';
                }}
                ItemSeparatorComponent={() => <Separator space={spacing.s} />}
                ListHeaderComponent={
                    <>
                        <ListItemHeader chain={chain} address={address} />
                        <Loading
                            isLoading={isLoadingToken || isLoadingHistory}
                            size={'medium'}
                            style={styles.loading}
                        />
                        <Separator space={spacing.s} />
                    </>
                }
            />
        </SafeAreaView>
    );
};

const keyExtractor = (item: WalletAsset | WalletTxSticky, index: number) => {
    if (isWalletTransaction(item)) return item.signature;
    if (isWalletAsset(item)) return item.address;
    if (isStickyItem(item)) return `sticky-${item.timestamp}`;
    return `item-${index}`;
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: spacing.th,
            paddingVertical: spacing.l,
        },
        loading: {
            alignSelf: 'center',
            marginVertical: spacing.l,
        },
    });

export default TokenList;
