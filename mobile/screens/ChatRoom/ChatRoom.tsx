import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {spacing} from '@/utils/styles';
import {KeyboardGestureArea} from 'react-native-keyboard-controller';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Reanimated, {useAnimatedProps, useAnimatedStyle} from 'react-native-reanimated';
import {interpolate} from '@shopify/react-native-skia';
import {useKeyboardAnimation} from '@/screens/ChatRoom/hooks/useKeyboardAnimation';
import {ChatRoomInput, ChatRoomInputRef} from '@/screens/ChatRoom/ChatRoomInput';
import {Feather} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {ChatBubble} from '@/screens/ChatRoom/chatComponents/ChatBubble';
import Separator from '@/components/Separator/Separator';

const ChatRoom = ({navigation}: RootStackScreenProps<'ChatRoom'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const {progress, height, onScroll, offset, inset} = useKeyboardAnimation();
    const {bottom: bottomInsets} = useSafeAreaInsets();
    const scrollViewRef = useRef<Reanimated.ScrollView>(null);

    const nav = useNavigation();
    useLayoutEffect(() => {
        nav.setOptions({title: ''});
    }, []);

    const bottomViewStyle = useAnimatedStyle(
        () => ({
            transform: [{translateY: -height.value}],
            paddingBottom: interpolate(progress.value, [0, 1], [bottomInsets, 0]),
        }),
        [],
    );

    const scrollToBottom = useCallback(() => {
        scrollViewRef.current?.scrollToEnd({animated: false});
    }, []);
    const props = useAnimatedProps(() => ({
        contentInset: {bottom: inset.value},
        contentOffset: {x: 0, y: offset.value},
    }));

    const chatRoomInputRef = useRef<ChatRoomInputRef>(null);
    const onTapEnded = useCallback(() => {
        chatRoomInputRef.current?.hideShow();
    }, []);

    return (
        <KeyboardGestureArea interpolator="ios" style={{flex: 1}}>
            <Reanimated.ScrollView
                style={[styles.container, {transform: [{translateY: -height.value}]}]}
                ref={scrollViewRef}
                onContentSizeChange={scrollToBottom}
                contentContainerStyle={styles.contentContainerStyle}
                keyboardDismissMode="interactive"
                animatedProps={props}
                onScroll={onScroll}
                automaticallyAdjustContentInsets={false}
                onTouchStart={onTapEnded}
                contentInsetAdjustmentBehavior="never">
                <View style={styles.encryptedWrap}>
                    <Feather name="lock" style={styles.encryptedIcon} />
                    <Text style={styles.encryptedInfo}>
                        All conversations in this chat are end-to-end encrypted. Only you and the recipient can read
                        them.
                    </Text>
                </View>
                <ChatBubble senderID="" message="Did you see that rabbit in the yard this morning?" />
                <ChatBubble
                    senderID=""
                    message="Yes, it was munching on some carrots, wasn't it? I wonder where it came from."
                />
                <ChatBubble senderID="" message="" cryptoRequest={true} />
                <ChatBubble
                    senderID="me"
                    message="I think it might belong to the new neighbors. It had a little blue collar."
                />
                <ChatBubble
                    senderID=""
                    message="No way! I didn't know they had a pet. I'll have to ask them about it."
                    images={[
                        'https://cdn.midjourney.com/553a8ac2-c027-4156-b1a5-7d4cfe65f820/0_3.webp',
                        'https://cdn.midjourney.com/2cb4cf8b-5f75-4cf4-b478-60befff386b6/0_2.webp',
                        'https://cdn.midjourney.com/a75d98bc-fc51-4310-9d01-295a5be868b6/0_3.webp',
                    ]}
                />
                <ChatBubble senderID="me" message="I think you're right. I saw them walking it yesterday." />
                <ChatBubble
                    senderID="me"
                    message="That's so cute! I'll have to go over and say hi to it. Maybe they'll let me pet it."
                    images={['https://cdn.midjourney.com/c61bee9c-8c7a-4279-b141-87d37ff54441/0_2.webp']}
                />
                <ChatBubble
                    senderID=""
                    message="I'll let you know how it goes. Maybe we can take it for a walk together sometime."
                />
                <Separator space={spacing.xl} />
                {/*<CryptoRequest />*/}
            </Reanimated.ScrollView>
            <Reanimated.View style={[styles.bottomWrapper, bottomViewStyle]}>
                <ChatRoomInput ref={chatRoomInputRef} />
            </Reanimated.View>
        </KeyboardGestureArea>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainerStyle: {
            paddingBottom: 100,
            marginHorizontal: spacing.th,
        },
        bottomWrapper: {
            backgroundColor: theme.colors.cardBackground,
            borderTopColor: theme.colors.border,
            position: 'absolute',
            borderTopWidth: 1,
            width: '100%',
            bottom: 0,
        },
        chatPlusIcon: {
            fontSize: 24,
            color: theme.colors.primary,
        },
        encryptedWrap: {
            padding: spacing.xl,
            alignItems: 'center',
            gap: spacing.m,
        },
        encryptedIcon: {
            fontSize: 18,
            color: theme.colors.textSecondary,
        },
        encryptedInfo: {
            color: theme.colors.textSecondary,
            textAlign: 'center',
            fontSize: 10,
        },
    });

export default ChatRoom;
