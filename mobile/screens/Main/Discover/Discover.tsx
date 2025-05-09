import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import Lottie from 'lottie-react-native';
import Separator from '@/components/Separator/Separator';
import {spacing} from '@/utils/styles';

const Discover = ({navigation}: CommonStackScreenProps<'Discover'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                <Lottie
                    colorFilters={[]}
                    style={styles.animation}
                    resizeMode="cover"
                    source={require('@/assets/animation/astronaut-falling.json')}
                    autoPlay
                    loop={true}
                />
                <Separator space={spacing.l} />
                <Text variant={'header'}>Circles</Text>
                <Text style={styles.cooking}>In the kitchen cooking..{'\n'}Coming Soon</Text>
            </View>
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
