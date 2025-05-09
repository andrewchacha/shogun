import Pressable from '@/components/Button/Pressable';
import {View} from 'react-native';
import Text from '@/components/Text/Text';
import React from 'react';
import {useThemeStyleSheet} from '@/hooks/utility/useThemeStyleSheet';
import {privateCardStyles} from '@/screens/Privacy/components/sharedStyles';

export function ItemAutomaticLock() {
    const styles = useThemeStyleSheet(privateCardStyles);
    return (
        <Pressable style={styles.cardWrap}>
            <View style={styles.cardWrapInner}>
                <Text style={styles.cartTitle}>Lock After</Text>
                <Text style={styles.cardInfo}>When app goes into background.</Text>
            </View>
            <Text style={styles.cardValue}>Immediately</Text>
        </Pressable>
    );
}
