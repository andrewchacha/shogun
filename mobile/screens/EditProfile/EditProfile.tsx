import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {hitSlop, rounded, spacing} from '@/utils/styles';
import {useMe} from '@/hooks/api/useMe';
import Pressable from '@/components/Button/Pressable';
import Markdown from '@/components/Markdown/Markdown';
import Separator from '@/components/Separator/Separator';
import {ThumbnailChanger} from '@/screens/EditProfile/components/ThumbnailChanger';

const EditProfile = ({navigation}: CommonStackScreenProps<'EditProfile'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data} = useMe(true);

    if (!data?.data) {
        return null;
    }
    const me = data.data;
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <ThumbnailChanger />
                <Pressable
                    style={styles.inputWrap}
                    hitSlop={hitSlop}
                    onPress={() => {
                        navigation.navigate('EditName');
                    }}>
                    <Text style={styles.inputKey}>Name</Text>
                    <View style={styles.inputValueWrap}>
                        <TextInput
                            pointerEvents={'none'}
                            editable={false}
                            placeholder={'Enter your name'}
                            placeholderTextColor={theme.colors.textTertiary}
                            style={styles.inputValue}>
                            {me.name}
                        </TextInput>
                    </View>
                </Pressable>

                <Pressable
                    style={styles.inputWrap}
                    onPress={() => {
                        navigation.navigate('EditUsername');
                    }}>
                    <Text style={styles.inputKey}>Username</Text>
                    <View style={styles.inputValueWrap}>
                        <Text style={styles.inputValue}>{me.username}</Text>
                    </View>
                </Pressable>

                <Pressable
                    style={styles.inputWrap}
                    onPress={() => {
                        navigation.navigate('EditBio');
                    }}>
                    <Text style={styles.inputKey}>Bio</Text>
                    <Separator space={spacing.xs} />
                    {me.bio ? (
                        <Markdown>{me.bio}</Markdown>
                    ) : (
                        <View style={styles.inputValueWrap}>
                            <Text style={styles.inputValue} />
                        </View>
                    )}
                </Pressable>
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
        },
        imageWrap: {
            marginTop: spacing.l,
            alignSelf: 'center',
        },
        thumbnail: {
            width: 120,
            height: 120,
            borderRadius: 120,
        },
        photoWrap: {
            ...theme.cardVariants.tag,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: rounded.full,
            padding: spacing.s,
            position: 'absolute',
            bottom: 0,
            right: 0,
        },
        photoIcon: {
            color: theme.colors.textPrimary,
            fontSize: 18,
        },
        inputWrap: {
            marginTop: spacing.l,
        },
        inputKey: {
            color: theme.colors.textSecondary,
            fontFamily: 'Font-400',
        },
        inputValueWrap: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.textTertiary,
        },
        inputValue: {
            color: theme.colors.textPrimary,
            paddingVertical: spacing.m,
            fontFamily: 'Font-600',
            marginTop: spacing.s,
        },
        bioWrap: {
            backgroundColor: theme.isDark ? theme.colors.cardBackground : '#F4F8FB',
            padding: spacing.m,
            borderRadius: rounded.l,
            marginTop: spacing.s,
        },
    });

export default EditProfile;
