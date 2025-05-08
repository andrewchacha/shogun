import Pressable from '@/components/Button/Pressable';
import {AppTheme, hitSlop, rounded, spacing} from '@/utils/styles';
import {Feather} from '@expo/vector-icons';
import {Keyboard, StyleSheet, TextInput, View} from 'react-native';
import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import Reanimated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {PlusCrypto} from '@/screens/ChatRoom/plusComponents/PlusCrypto';
import {PlusPhotos} from '@/screens/ChatRoom/plusComponents/PlusPhotos';
import {PlusCamera} from '@/screens/ChatRoom/plusComponents/PlusCamera';
import {PlusFile} from '@/screens/ChatRoom/plusComponents/PlusFile';
import {PlusContact} from '@/screens/ChatRoom/plusComponents/PlusContact';
import {PlusLocation} from '@/screens/ChatRoom/plusComponents/PlusLocation';
import {PlusCryptoRequest} from '@/screens/ChatRoom/plusComponents/PlusCryptoRequest';

type Props = {};
export type ChatRoomInputRef = {
    hideShow: () => void;
};

export const ChatRoomInput = forwardRef<ChatRoomInputRef, Props>((props, ref) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [showPlus, setShowPlus] = useState(false);
    const plusItemsHeight = useSharedValue(0); // Initial height
    const plusItemAnimatedStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(plusItemsHeight.value, {
                duration: 200,
            }),
            overflow: 'hidden',
        };
    });

    useImperativeHandle(ref, () => ({
        hideShow: () => toggleShowPlus(false),
    }));

    const toggleShowPlus = (show: boolean) => {
        plusItemsHeight.value = show ? 130 : 0;
        Keyboard.dismiss();
        setShowPlus(show);
    };

    return (
        <View>
            <View style={styles.container}>
                <Pressable
                    hitSlop={hitSlop}
                    onPress={() => {
                        toggleShowPlus(!showPlus);
                    }}>
                    <Feather name="plus" style={styles.actionsIcons} />
                </Pressable>
                <View style={styles.inputWrapper}>
                    <TextInput style={styles.chatInput} multiline={true} placeholder={''} />
                </View>
                <Pressable hitSlop={hitSlop}>
                    <Feather name="camera" style={styles.actionsIcons} />
                </Pressable>
                <Pressable hitSlop={hitSlop}>
                    <Feather name="mic" style={styles.actionsIcons} />
                </Pressable>
            </View>
            <Reanimated.ScrollView
                style={[styles.plusItemScroll, plusItemAnimatedStyle]}
                contentContainerStyle={styles.plusItems}
                horizontal
                showsHorizontalScrollIndicator={false}>
                <PlusCrypto />
                <PlusPhotos />
                <PlusCamera />
                <PlusCryptoRequest />
                <PlusFile />
                <PlusContact />
                <PlusLocation />
            </Reanimated.ScrollView>
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.m,
            gap: spacing.s,
        },
        actionsIcons: {
            fontSize: 20,
            color: theme.colors.textSecondary,
            padding: spacing.xs,
        },
        inputWrapper: {
            backgroundColor: theme.colors.cardBackgroundLight,
            borderRadius: rounded.l,
            flex: 1,
        },
        chatInput: {
            color: theme.colors.textPrimary,
            maxHeight: 120,
            fontSize: 16,
            padding: 10,
            flex: 1,
        },
        plusItemScroll: {
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.colors.border,
        },
        plusItems: {
            padding: spacing.l,
            gap: spacing.l,
        },
    });
