import Button from '@/components/Button/Button';
import Separator from '@/components/Separator/Separator';
import Text from '@/components/Text/Text';
import {Ionicons} from '@expo/vector-icons';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import {spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useRef} from 'react';
import {StyleSheet, View, Image} from 'react-native';
import Tag from '@/components/Tag/Tag';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Welcome = ({navigation}: RootStackScreenProps<'Welcome'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const changeLanguageModal = useRef<BottomSheetModal>(null);
    const insets = useSafeAreaInsets();

    const onChangeLanguage = () => {
        changeLanguageModal.current?.present();
    };

    const onImportWallet = () => {
        navigation.navigate('WalletImport');
    };
    const onCreateWallet = () => {
        navigation.navigate('WalletNew');
    };

    return (
        <View style={styles.container}>
            <Image source={require('@/assets/ninja_mid.webp')} style={styles.image} resizeMode={'cover'} />
            <View style={[styles.innerWrap, {paddingBottom: insets.bottom + spacing.m}]}>
                <View style={styles.topWrap}>
                    <View style={styles.mottoWrap}>
                        <Text variant="header" style={styles.header}>
                            Welcome to Shogun
                        </Text>
                        <Separator space={spacing.s} />
                        <Text style={styles.motto}>
                            E2E secure chat and community platform, no emails, no phone numbers required.
                        </Text>
                    </View>
                </View>
                <Separator space={spacing.xl} />
                <Button title={'Create New Passphrase'} variant={'primary'} onPress={onCreateWallet} />
                <Separator space={spacing.l} />
                <Button title={'Import Passphrase'} variant={'primary'} onPress={onImportWallet} />
            </View>
            <Tag
                onPress={onChangeLanguage}
                title={'English'}
                icon={<Ionicons name="language-sharp" style={styles.languageIcon} />}
                containerStyle={[styles.languagePicker, {top: insets.top}]}
            />
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        image: {
            width: '100%',
            flex: 1,
        },
        topWrap: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        mottoWrap: {
            flex: 1,
        },
        header: {
            fontSize: 24,
        },
        motto: {
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
        innerWrap: {
            paddingHorizontal: 24,
            paddingTop: 40,
            backgroundColor: theme.colors.mainBackground,
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            marginTop: -40,
        },
        languagePicker: {
            position: 'absolute',
            right: spacing.l,
        },
        languageIcon: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
    });

export default Welcome;
