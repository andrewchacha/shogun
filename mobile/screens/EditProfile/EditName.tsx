import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {spacing} from '@/utils/styles';
import {useMe} from '@/hooks/api/useMe';
import TextInput from '@/components/TextInput/TextInput';
import Separator from '@/components/Separator/Separator';
import {useUserUpdater} from '@/hooks/api/useUserUpdater';
import Button from '@/components/Button/Button';
import {ToastController} from '@/components/Toast/Toast';
import * as Haptics from 'expo-haptics';
import {ApiStatus} from '@/utils/types/api';
import {useSystem} from '@/hooks/api/useSystem';

const EditName = ({navigation}: CommonStackScreenProps<'EditName'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data} = useMe(true);
    const [newName, setNewName] = useState(data?.data?.name || '');
    const {isUpdating, runUpdate} = useUserUpdater();

    const {data: system} = useSystem();
    const MAX_NAME_LENGTH = system?.data?.name_max_length || 50;

    const isValidName = newName.length > 0 && newName.length <= MAX_NAME_LENGTH;
    const onUpdate = async () => {
        if (newName === data?.data?.name) {
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
            await runUpdate({name: newName});
            navigation.goBack();
        } catch (error) {
            // @ts-expect-error could be api error
            if (error.status === ApiStatus.ErrorUpdateNameBlocked) {
                ToastController.show({
                    content: `You can change your name only once every ${system?.data?.name_lock} day(s).`,
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
        if (text.length <= MAX_NAME_LENGTH) {
            setNewName(text);
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
                    <Text>Name</Text>
                    <Text style={[styles.counter, newName.length >= MAX_NAME_LENGTH && styles.counterDanger]}>
                        {newName.length}/50
                    </Text>
                </View>
                <Separator space={spacing.s} />
                <TextInput
                    clearButtonMode={'always'}
                    value={newName}
                    autoFocus={true}
                    onChangeText={onChangeText}
                    returnKeyType={'done'}
                />
                <Separator space={spacing.m} />
                <Text style={styles.explainer}>
                    Enter your full name, nickname or business name. People will be able to find you by searching using
                    this name.
                </Text>
                <Separator space={spacing.m} />
                <Text style={styles.explainer} weight={'600'}>
                    You can change your name only once every {system?.data?.name_lock} day(s).
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
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
        counterDanger: {
            color: theme.colors.warning,
            fontFamily: 'Font-600',
        },
    });

export default EditName;
