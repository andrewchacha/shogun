import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import Text from '@/components/Text/Text';
import {hideMiddle} from '@/utils/helper/formatter';
import {AddressActions} from '@/screens/TokenList/components/AddressActions';
import {formatAmount} from '@/utils/helper/numberFormatter';
import BigNumber from 'bignumber.js';
import TokenItem from '@/screens/TokenList/components/TokenItem';
import React, {useEffect} from 'react';
import {useMe} from '@/hooks/api/useMe';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import {Chain} from '@/chains/chain';
import {useWalletAssets} from '@/hooks/wallets/useWalletAssets';
import TagPrimary from '@/components/Tag/TagPrimary';
import {FontAwesome6, MaterialCommunityIcons} from '@expo/vector-icons';
import {atom, useAtom} from 'jotai';
import {suiClient} from '@/chains/sui/sui';
import Separator from '@/components/Separator/Separator';

type Props = {
    address: string;
    chain: Chain;
};

export const ListKind = {
    Token: 'token',
    NFT: 'nft',
    History: 'history',
} as const;
export type ListKind = (typeof ListKind)[keyof typeof ListKind];
export const listKindAtom = atom<ListKind>('token');

export function ListItemHeader({address, chain}: Props) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data: myData} = useMe(false);
    const me = myData?.data;
    const {data} = useWalletAssets(address, chain);
    const native = data?.data?.native;
    const tokens = data?.data?.tokens;

    const [kind, setKind] = useAtom(listKindAtom);

    return (
        <>
            <View style={styles.accountWrap}>
                <Image
                    uri={me?.thumbnail?.uri}
                    blurHash={me?.thumbnail?.blurhash}
                    preset="sm"
                    style={styles.thumbnail}
                />
                <View style={styles.accountMid}>
                    <Text style={styles.username}>@{me?.username}</Text>
                    <Text style={styles.chain}>
                        {chain} <Text style={styles.address}>({hideMiddle(address, 4)})</Text>
                    </Text>
                </View>
                <AddressActions chain={chain} address={address} />
            </View>
            <View style={styles.usdValueWrap}>
                <Text style={styles.usdValue} weight="600">
                    ${formatAmount(data?.data?.usd_value, {price: '1'})}
                </Text>
                {native?.ui_amount && (
                    <View style={styles.usdValueItems}>
                        <Text style={styles.usdValueInfo}>
                            {new BigNumber(native?.ui_amount).toPrecision(4)} {native?.symbol}
                        </Text>
                        {tokens && tokens?.length > 0 && (
                            <Text style={styles.usdValueInfo}> + {tokens?.length || 0} Token</Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.selectors}>
                <TagPrimary
                    title={'Token'}
                    isSelected={kind === 'token'}
                    icon={<FontAwesome6 name="coins" />}
                    onPress={() => {
                        setKind(ListKind.Token);
                    }}
                />
                <TagPrimary
                    title={'History'}
                    isSelected={kind === 'history'}
                    icon={<MaterialCommunityIcons name="lightning-bolt" />}
                    onPress={() => {
                        setKind(ListKind.History);
                    }}
                />
            </View>
            {native && kind === 'token' && (
                <>
                    <Separator space={spacing.l} />
                    <TokenItem {...native} />
                </>
            )}
        </>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        accountWrap: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        accountMid: {
            flex: 1,
        },
        thumbnail: {
            borderRadius: rounded.full,
            marginRight: spacing.s,
            height: 50,
            width: 50,
        },
        username: {
            fontFamily: 'Font-600',
        },
        chain: {
            textTransform: 'capitalize',
            color: theme.colors.textSecondary,
        },
        address: {},
        usdValueWrap: {
            marginTop: spacing.xl,
            marginBottom: spacing.m,
            alignItems: 'center',
        },
        usdValue: {
            fontSize: 45,
        },
        actionTags: {
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: rounded.xl,
        },
        actionTagIcon: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        usdValueItems: {
            ...theme.cardVariants.tag,
            backgroundColor: theme.colors.mainBackground,
            marginTop: spacing.s,
            borderRadius: rounded.full,
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
        },
        usdValueInfo: {
            color: theme.colors.textSecondary,
            fontSize: 10,
            fontFamily: 'Font-400',
        },
        selectors: {
            flexDirection: 'row',
            gap: spacing.m,
        },
    });
