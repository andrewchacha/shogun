import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {rounded, spacing} from '@/utils/styles';
import {useMe} from '@/hooks/api/useMe';
import TextInput from '@/components/TextInput/TextInput';
import Separator from '@/components/Separator/Separator';
import {useUserUpdater} from '@/hooks/api/useUserUpdater';
import Button from '@/components/Button/Button';
import {ToastController} from '@/components/Toast/Toast';
import * as Haptics from 'expo-haptics';
import {ApiStatus} from '@/utils/types/api';
import {useSystem} from '@/hooks/api/useSystem';

const VALID_USERNAME = /^[a-zA-Z0-9_]+$/;
const EditUsername = ({navigation}: CommonStackScreenProps<'EditUsername'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data} = useMe(true);
    const [newUsername, setNewUsername] = useState(data?.data?.username || '');
    const {isUpdating, runUpdate} = useUserUpdater();
    const {data: system} = useSystem();

    const MAX_USERNAME_LENGTH = system?.data?.username_max_length || 18;
    const MIN_USERNAME_LENGTH = system?.data?.username_min_length || 6;

    const isValidName =
        newUsername.length >= MIN_USERNAME_LENGTH &&
        newUsername.length <= MAX_USERNAME_LENGTH &&
        VALID_USERNAME.test(newUsername);

    const onUpdate = async () => {
        if (newUsername === data?.data?.username) {
            navigation.goBack();
            return;
        }
        if (!isValidName) {
            ToastController.show({
                content: 'Enter valid name',
                kind: 'error',
            });
            return;
        }
        try {
            await runUpdate({username: newUsername});
            navigation.goBack();
        } catch (error) {
            // @ts-expect-error could be api error
            if (error.status === ApiStatus.ErrorUpdateUsernameBlocked) {
                ToastController.show({
                    content: `You can change your username only once every ${system?.data?.username_lock} days`,
                    kind: 'error',
                });
                return;
            }
            ToastController.show({
                content: JSON.stringify(error),
                kind: 'error',
            });
        }
    };
    const onChangeText = (text: string) => {
        if (text.length > 0 && !VALID_USERNAME.test(text)) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        if (text.length <= MAX_USERNAME_LENGTH) {
            setNewUsername(text);
            return;
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
                    <Text>Username</Text>
                    <Text style={[styles.counter, !isValidName && styles.counterDanger]}>
                        {newUsername.length}/{MAX_USERNAME_LENGTH}
                    </Text>
                </View>
                <Separator space={spacing.s} />
                <TextInput
                    clearButtonMode={'always'}
                    value={newUsername}
                    autoFocus={true}
                    onChangeText={onChangeText}
                    returnKeyType={'done'}
                />
                <Separator space={spacing.m} />
                <Text style={styles.explainer}>
                    Username is unique across the platform, people can use this to find you.
                </Text>
                <Separator space={spacing.m} />
                <Text style={styles.explainer}>
                    You can use alphabet, numbers, and underscore only. Username should be between {MIN_USERNAME_LENGTH}{' '}
                    and {MAX_USERNAME_LENGTH} characters long. Username is case-insensitive.
                </Text>
                <Separator space={spacing.m} />
                <Text style={styles.explainer} weight={'600'}>
                    You can change your username only once every {system?.data?.username_lock} days
                </Text>
                <Separator space={spacing.l} />
                <Button disabled={!isValidName} title={'Update'} isLoading={isUpdating} onPress={onUpdate} />
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
    });

export default EditUsername;
