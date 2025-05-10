import {ScrollView, StyleSheet, View} from 'react-native';
import {Recipient} from '@/screens/SendCrypto/components/Recipient';
import React, {useMemo} from 'react';
import {getAccountStore} from '@/storage/accountStore';
import {Chain} from '@/chains/chain';
import {useUserSearchAddresses} from '@/hooks/api/useUserSearch';
import Loading from '@/components/Loading/Loading';
import {AppTheme, spacing} from '@/utils/styles';
import {SendCryptoRecipient} from '@/navigation/types';
import Text from '@/components/Text/Text';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';

type Props = {
    onRecipient: (r: SendCryptoRecipient) => void;
    chain: Chain;
    filterAddress?: string;
};

export const RecipientMyAddresses = ({onRecipient, chain, filterAddress}: Props) => {
    const myAddresses = useMemo(() => {
        const store = getAccountStore();
        return store.getMyAddressesForChain(chain);
    }, [chain]);

    const {data, isLoading} = useUserSearchAddresses(myAddresses, chain);
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <View style={styles.container}>
            <Text variant={'subheader'} style={styles.head}>
                My Other Accounts
            </Text>
            <Loading isLoading={isLoading} size={'medium'} style={{alignSelf: 'center', marginTop: spacing.xl}} />
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollViewContent}>
                {data?.data?.map(recipient => {
                    if (filterAddress && recipient.address === filterAddress) {
                        return null;
                    }
                    return (
                        <Recipient
                            key={recipient.address}
                            thumbnail={recipient.thumbnail.uri}
                            address={recipient.address}
                            username={recipient.username}
                            onPress={() =>
                                onRecipient({
                                    address: recipient.address,
                                    chain: chain,
                                    username: recipient.username,
                                    thumbnail: recipient.thumbnail.uri,
                                })
                            }
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {},
        head: {},
        scrollView: {
            marginHorizontal: -spacing.th,
        },
        scrollViewContent: {
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.th,
            gap: spacing.m,
        },
    });
