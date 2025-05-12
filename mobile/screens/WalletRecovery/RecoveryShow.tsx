import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Tag from '@/components/Tag/Tag';
import {AntDesign, MaterialIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import {ToastController} from '@/components/Toast/Toast';
import {getAccountStore} from '@/storage/accountStore';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';
import * as Haptics from 'expo-haptics';

export const RecoveryShow = () => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const navigation = useNavigation();

    const currentAccountID = useCurrentAccountID();

    const mnemonic = useMemo(() => {
        if (!currentAccountID) return null;
        const store = getAccountStore();
        const walletID = store.getCurrentWalletAllByAccountID(currentAccountID);
        return walletID?.mnemonic;
    }, [currentAccountID]);

    const onEncrypt = () => {
        if (!mnemonic) return;
        navigation.navigate('EncryptPassphrase', {passphrase: mnemonic});
    };

    const onCopy = () => {
        if (!mnemonic) return;
        void Clipboard.setStringAsync(mnemonic);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        ToastController.show({kind: 'info', content: 'Copied to clipboard'});
    };

    if (!mnemonic) return null;
    return (
        <>
            <View style={styles.warningWrap}>
                <Text style={styles.warningHead} weight={'600'}>
                    Do not share your recovery phrase with anyone.
                </Text>
            </View>
            <View style={styles.phraseWrap}>
                <Text style={styles.phrase}>{mnemonic}</Text>
            </View>
            <View style={styles.actions}>
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={onEncrypt}
                    title={'Encrypt'}
                    icon={<MaterialIcons name="enhanced-encryption" style={styles.tagIcon} />}
                />
                <Tag
                    containerStyle={styles.tagWrap}
                    onPress={onCopy}
                    title={'Copy'}
                    icon={<AntDesign name="copy1" style={styles.tagIcon} />}
                />
            </View>
        </>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        warningWrap: {
            backgroundColor: theme.colors.warning + '30',
            padding: spacing.m,
            borderRadius: rounded.l,
            alignItems: 'center',
        },
        warningHead: {
            color: theme.colors.warning,
            textAlign: 'center',
        },
        warningText: {
            color: theme.colors.warning,
            fontSize: 12,
            textAlign: 'center',
        },
        head: {
            marginTop: spacing.l,
        },
        phrase: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-700',
            fontSize: 18,
        },
        phraseWrap: {
            ...theme.cardVariants.simple,
            padding: spacing.xl,
            marginTop: spacing.s,
            borderRadius: rounded.l,
        },
        actions: {
            marginTop: spacing.m,
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.m,
        },
        tagWrap: {
            ...theme.cardVariants.tagMute,
            borderRadius: rounded.m,
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.l,
            justifyContent: 'space-between',
            flex: 1,
        },
        tagIcon: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
    });
