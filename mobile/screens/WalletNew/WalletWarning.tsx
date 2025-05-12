import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import {ToastController} from '@/components/Toast/Toast';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {palette, rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Pressable from '@/components/Button/Pressable';

type Props = {
    onNext: () => void;
};
export const WalletWarning = ({onNext}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const [understand1, setUnderstand1] = useState(false);
    const [understand2, setUnderstand2] = useState(false);

    const handleNext = () => {
        if (!understand1 || !understand2) {
            ToastController.show({kind: 'error', content: 'Please check the checkboxes'});
            return;
        }
        onNext();
    };

    return (
        <View style={styles.scrollView}>
            <Text style={[styles.warning]}>
                We'll generate a passphrase for you.{' '}
                <Text style={[styles.warning, {color: theme.isDark ? palette.rose400 : palette.rose500}]}>
                    This passphrase is the only way to access your account.
                </Text>
            </Text>
            <Separator space={spacing.l} />
            <Text style={[styles.warning]}>
                Write it down and keep it safe.
                <Text style={[styles.warning, {color: theme.isDark ? palette.rose400 : palette.rose500}]}>
                    If you lose it we can't recover the account for you.
                </Text>
            </Text>

            <View style={{flex: 1}} />

            <Pressable
                style={styles.checkWrap}
                onPress={() => {
                    setUnderstand1(v => !v);
                }}>
                <Checkbox
                    containerStyle={styles.checkbox}
                    innerStyle={styles.checkboxInner}
                    value={understand1}
                    onValueChange={setUnderstand1}
                />
                <Text style={styles.understandText}>
                    I understand if I lose the passphrase there's no way to recover the account.
                </Text>
            </Pressable>
            <Pressable
                style={styles.checkWrap}
                onPress={() => {
                    setUnderstand2(v => !v);
                }}>
                <Checkbox
                    containerStyle={styles.checkbox}
                    innerStyle={styles.checkboxInner}
                    value={understand2}
                    onValueChange={setUnderstand2}
                />
                <Text style={styles.understandText}>
                    I understand if I share the passphrase with anyone they have full control of my account and I can't
                    stop them.
                </Text>
            </Pressable>

            <Separator space={spacing.xl} />
            <Button title={'Generate Passphrase'} disabled={!understand1 || !understand2} onPress={handleNext} />
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        scrollView: {
            marginHorizontal: spacing.th,
            marginVertical: spacing.xl,
            flex: 1,
        },
        checkWrap: {
            ...theme.cardVariants.simple,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.m,
            padding: spacing.m,
            borderRadius: rounded.l,
        },
        checkbox: {
            borderRadius: rounded.m,
            marginRight: spacing.m,
            borderWidth: 2,
            height: 28,
            width: 28,
            borderColor: theme.colors.textPrimary,
        },
        checkboxInner: {
            color: theme.colors.textPrimary,
            fontSize: 14,
        },
        understandText: {
            fontFamily: 'Font-500',
            flex: 1,
        },
        warning: {
            fontSize: 20,
            textAlign: 'center',
            fontFamily: 'Font-700',
        },
    });
