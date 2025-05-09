import {Chain} from '@/chains/chain';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Text from '@/components/Text/Text';
import {useWalletAssets} from '@/hooks/wallets/useWalletAssets';
import {ChainLogo} from '@/components/ChainLogo/ChainLogo';
import Loading from '@/components/Loading/Loading';
import Pressable from '@/components/Button/Pressable';
import {useNavigation} from '@react-navigation/native';
import {formatAmount} from '@/utils/helper/numberFormatter';
import Image from '@/components/Image/Image';
import {hideMiddle} from '@/utils/helper/formatter';
import Separator from '@/components/Separator/Separator';
import {useSetAtom} from 'jotai';
import {totalsAtom} from '@/screens/Main/MyProfile/totalValue';
import {useEffect} from 'react';

type Props = {
    chain: Chain;
    address: string;
};

const tokenSliceCut = 2;
export const WalletCard = ({chain, address}: Props) => {
    const {data, isLoading} = useWalletAssets(address, chain);
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const writeTotal = useSetAtom(totalsAtom);
    useEffect(() => {
        const d = data?.data?.usd_value || '0';
        writeTotal(prev => ({...prev, [address]: d}));
    }, [data?.data?.usd_value]);

    const nav = useNavigation();
    const onCardPress = () => {
        nav.navigate('TokenList', {chain, address});
    };

    const nativeCoin = data?.data?.native;
    const otherTokens = data?.data?.tokens ? data.data.tokens.length - tokenSliceCut : 0;
    return (
        <Pressable style={styles.container} onPress={onCardPress}>
            <View style={styles.headerWrap}>
                <Text style={styles.chain}>
                    {chain} ({hideMiddle(address, 4)})
                </Text>
                <Text style={styles.totalValue}>${formatAmount(data?.data?.usd_value, {price: '1'})}</Text>
                {/*<Feather name="chevron-right" style={styles.more} />*/}
                <Loading style={{width: 15, height: 15}} isLoading={isLoading} />
            </View>
            <Separator space={spacing.xs} />
            <View style={styles.tokenWrap}>
                <ChainLogo chain={chain} style={styles.coinLogo} />
                <Text style={styles.amount}>
                    {formatAmount(nativeCoin?.ui_amount, {price: nativeCoin?.price})} {nativeCoin?.symbol}
                </Text>
                <Text style={styles.usdAmount}>${formatAmount(nativeCoin?.total, {price: '1'})}</Text>
            </View>
            {data?.data?.tokens.slice(0, tokenSliceCut).map(token => (
                <View style={styles.tokenWrap} key={token.address}>
                    <Image uri={token.logo} style={styles.coinLogo} />
                    <Text style={styles.amount}>
                        {formatAmount(token.ui_amount, {price: token.price})} {token.symbol}
                    </Text>
                    <Text style={styles.usdAmount}>${formatAmount(token.total, {price: '1'})}</Text>
                </View>
            ))}
            {otherTokens > 0 && <Text style={styles.otherTokens}>+{otherTokens} other token</Text>}
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.simple,
            borderRadius: rounded.l,
            padding: spacing.s,
            marginBottom: spacing.m,
        },
        headerWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.s,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border,
        },
        chain: {
            textTransform: 'capitalize',
            fontFamily: 'Font-500',
            flex: 1,
        },
        coinLogo: {
            height: 20,
            width: 20,
            borderRadius: 10,
        },
        tokenWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.s,
            gap: spacing.s,
        },
        totalValue: {
            fontFamily: 'Font-600',
        },
        more: {
            fontSize: 18,
            color: theme.colors.textSecondary,
        },
        amount: {
            flex: 1,
        },
        usdAmount: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-400',
        },
        otherTokens: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-400',
            fontSize: 12,
            marginLeft: spacing.s,
        },
    });
