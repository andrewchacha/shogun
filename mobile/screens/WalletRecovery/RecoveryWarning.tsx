import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import React, {useLayoutEffect, useState} from 'react';
import {StyleSheet, View, ScrollView, Animated} from 'react-native';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import Checkbox from '@/components/Checkbox/Checkbox';
import Pressable from '@/components/Button/Pressable';
import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';

type Props = {
    onShow: () => void;
};
export const RecoverWarning = ({onShow}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [agreed, setAgreed] = useState(false);

    return (
        <>
            <Text style={styles.readCarefully} weight={'500'}>
                *Read carefully
            </Text>
            <View style={styles.section}>
                <View style={styles.iconBack}>
                    <Ionicons name="warning" style={styles.icon} />
                </View>
                <Text style={styles.text}>Your recovery phrase is the only way to recover your wallet.</Text>
            </View>
            <View style={styles.section}>
                <View style={styles.iconBack}>
                    <MaterialCommunityIcons name="ninja" style={styles.icon} />
                </View>
                <Text style={styles.text}>
                    Anyone with this recovery phrase can access all your accounts with full authority and you can't take
                    it back.
                </Text>
            </View>
            <View style={styles.section}>
                <View style={styles.iconBack}>
                    <MaterialIcons name="stop-screen-share" style={styles.icon} />
                </View>
                <Text style={styles.text}>Do not share your recover phrase with anyone including Shogun</Text>
            </View>
            <View style={styles.section}>
                <View style={styles.iconBack}>
                    <Entypo name="tablet-mobile-combo" style={styles.icon} />
                </View>
                <Text style={styles.text}>
                    If you are going to save it in an electronic device you could encrypt it with strong password before
                    saving
                </Text>
            </View>

            <Pressable
                style={styles.checkWrap}
                onPress={() => {
                    setAgreed(v => !v);
                }}>
                <Checkbox
                    containerStyle={styles.checkbox}
                    innerStyle={styles.checkboxInner}
                    value={agreed}
                    onValueChange={setAgreed}
                />
                <Text style={styles.understandText} weight={'600'}>
                    I understand the risks and I will keep my recovery phrase safe
                </Text>
            </Pressable>

            <Separator space={spacing.m} />
            <Button title={'Show Passphrase'} disabled={!agreed} onPress={onShow} variant={'danger'} />
        </>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        section: {
            ...theme.cardVariants.tag,
            borderRadius: rounded.l,
            padding: spacing.l,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
            marginTop: spacing.l,
        },
        iconBack: {
            backgroundColor: theme.colors.warning + '33',
            borderRadius: rounded.full,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 36,
            height: 36,
        },
        icon: {
            color: theme.colors.warning,
            fontSize: 18,
        },
        text: {
            flex: 1,
        },
        readCarefully: {
            color: theme.colors.warning,
            marginTop: spacing.l,
        },
        checkWrap: {
            paddingHorizontal: spacing.m,
            marginTop: spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
        },
        checkbox: {
            borderColor: theme.colors.textPrimary,
            borderRadius: rounded.m,
            marginRight: spacing.m,
            borderWidth: 2,
            height: 28,
            width: 28,
        },
        checkboxInner: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        understandText: {
            flex: 1,
        },
    });
