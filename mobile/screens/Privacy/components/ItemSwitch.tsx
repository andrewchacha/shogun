import Pressable from '@/components/Button/Pressable';
import {Switch, View} from 'react-native';
import Text from '@/components/Text/Text';
import React from 'react';
import {useThemeStyleSheet} from '@/hooks/utility/useThemeStyleSheet';
import {privateCardStyles} from '@/screens/Privacy/components/sharedStyles';

export type SwitchProps = {
    title: string;
    info?: string;
    value: boolean;
};

export const ItemSwitch = React.memo(({title, info, value}: SwitchProps) => {
    const styles = useThemeStyleSheet(privateCardStyles);
    return (
        <Pressable style={styles.cardWrap}>
            <View style={styles.cardWrapInner}>
                <Text style={styles.cartTitle}>{title}</Text>
                {info && <Text style={styles.cardInfo}>{info}</Text>}
            </View>
            <Switch value={value} />
        </Pressable>
    );
});
