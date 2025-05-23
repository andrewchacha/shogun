import {memo, useEffect, useState} from 'react';
import {FeedDataPrediction} from './chatsamples';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import Separator from '@/components/Separator/Separator';
import Button from '@/components/Button/Button';
import {formatAmount} from '@/utils/helper/numberFormatter';

export const Prediction = memo(({options, pool_coin}: FeedDataPrediction) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [seconds, setSeconds] = useState(400);

    useEffect(() => {
        if (seconds <= 0) return;

        const interval = setInterval(() => {
            setSeconds(s => s - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    return (
        <View style={styles.container}>
            {options.map((option, index) => (
                <View key={option.id} style={styles.option}>
                    <Image uri={option.avatar} style={styles.optionImage} />
                    <Text style={styles.optionText} weight="500">
                        {option.text}
                    </Text>
                    <Text style={styles.poolSize} weight="600">
                        {formatAmount(option.pool_size)} {pool_coin}
                    </Text>
                    <Separator space={spacing.m} />
                    <Button title={`Bet ${pool_coin}`} onPress={() => {}} />
                </View>
            ))}
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            gap: spacing.l,
        },
        option: {
            flex: 1,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: rounded.l + spacing.m,
            padding: spacing.m,
        },
        optionImage: {
            height: 120,
            width: '100%',
            borderRadius: rounded.l,
            marginBottom: spacing.m,
        },
        optionText: {
            color: theme.colors.textPrimary,
            fontSize: 16,
        },
        poolSize: {
            color: theme.colors.textPrimary,
            fontSize: 20,
        },
    });
