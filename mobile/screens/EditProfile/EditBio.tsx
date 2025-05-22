import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {rounded, spacing} from '@/utils/styles';
import {useMe} from '@/hooks/api/useMe';
import Separator from '@/components/Separator/Separator';
import {useUserUpdater} from '@/hooks/api/useUserUpdater';
import Button from '@/components/Button/Button';
import {ToastController} from '@/components/Toast/Toast';
import * as Haptics from 'expo-haptics';
// import {MarkdownTextInput} from '@expensify/react-native-live-markdown';
import {useSystem} from '@/hooks/api/useSystem';

const EditBio = ({navigation}: CommonStackScreenProps<'EditBio'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data} = useMe(true);
    const [newBio, setNewBio] = useState(data?.data?.bio || '');
    const {isUpdating, runUpdate} = useUserUpdater();
    const {data: system} = useSystem();

    const MAX_BIO_LENGTH = system?.data?.bio_max_length || 200;
    const isValidBio = newBio.length <= MAX_BIO_LENGTH;
    const onUpdate = async () => {
        if (newBio === data?.data?.bio) {
            navigation.goBack();
            return;
        }
        if (!isValidBio) {
            ToastController.show({
                content: 'Bio is too long.',
                kind: 'error',
            });
            return;
        }
        try {
            await runUpdate({bio: newBio});
            navigation.goBack();
        } catch (error) {
            ToastController.show({
                content: JSON.stringify(error),
                kind: 'error',
            });
        }
    };
    const onChangeText = (text: string) => {
        if (text.length <= MAX_BIO_LENGTH) {
            setNewBio(text);
            return;
        } else {
            setNewBio(text.substring(0, MAX_BIO_LENGTH));
        }
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    if (!data?.data) {
        return null;
    }
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.labelWrap}>
                    <Text>Bio</Text>
                    <Text style={[styles.counter, !isValidBio && styles.counterDanger]}>
                        {newBio.length}/{MAX_BIO_LENGTH}
                    </Text>
                </View>
                <Separator space={spacing.s} />
                <View style={styles.inputWrap}>
                    {/* <MarkdownTextInput
                        placeholder={'Enter your Bio in markdown'}
                        placeholderTextColor={theme.colors.textTertiary}
                        style={styles.textInput}
                        value={newBio}
                        multiline={true}
                        onChangeText={onChangeText}
                    /> */}
                </View>

                <Separator space={spacing.xl} />
                <Button disabled={!isValidBio} title={'Update'} isLoading={isUpdating} onPress={onUpdate} />
            </ScrollView>
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollContent: {
            marginHorizontal: spacing.th,
            marginVertical: spacing.th,
        },
        explainer: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        labelWrap: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        counter: {
            color: theme.colors.success,
            fontSize: 12,
            fontFamily: 'Font-600',
        },
        counterDanger: {
            color: theme.colors.warning,
        },
        inputWrap: {
            borderColor: theme.colors.border,
            borderRadius: rounded.l,
            borderWidth: 1,
        },
        textInput: {
            color: theme.colors.textPrimary,
            fontFamily: 'Font-500',
            padding: spacing.l,
            fontSize: 16,
            minHeight: 100,
            textAlign: 'left',
        },
    });

export default EditBio;
