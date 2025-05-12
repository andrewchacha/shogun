import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import {spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';

const Swap = ({navigation, route}: RootStackScreenProps<'Swap'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {fromChain, fromTokenAddress} = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({title: 'Send Crypto'});
    }, [navigation.setOptions]);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView
                contentContainerStyle={styles.scrollView}
                keyboardDismissMode={'interactive'}
                automaticallyAdjustKeyboardInsets={true}>
                <Separator space={spacing.l} />
                <Text variant={'subheader'}>Let's begin</Text>
                <Text>
                    Swap some crypto {fromChain} {fromTokenAddress}
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: spacing.th,
        },
    });

export default Swap;
