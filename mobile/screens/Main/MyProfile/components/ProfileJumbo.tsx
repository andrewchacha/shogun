import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import Tag from '@/components/Tag/Tag';
import {Entypo, Feather, FontAwesome, FontAwesome5, Ionicons} from '@expo/vector-icons';
import Separator from '@/components/Separator/Separator';
import {AppTheme, hitSlop, rounded, spacing} from '@/utils/styles';
import Text from '@/components/Text/Text';
import React, {useCallback, useRef} from 'react';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useMe} from '@/hooks/api/useMe';
import {useNavigation} from '@react-navigation/native';
import Pressable from '@/components/Button/Pressable';
import Markdown from '@/components/Markdown/Markdown';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import ScanQRCodeModal from '@/components/ScanQRCodeModal/ScanQRCodeModal';
import {MultiAccountModalController} from '@/components/MultiAccountModal/MultiAccountModal';
import {navigate} from '@/navigation/shared';

export const ProfileJumbo = React.memo(() => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data} = useMe(true);
    const navigation = useNavigation();

    const openMultiAccountModal = useCallback(() => {
        MultiAccountModalController.show();
    }, []);

    const scanQRCodeModal = useRef<BottomSheetModal>(null);
    const openScanQRCodeModal = useCallback(() => {
        scanQRCodeModal.current?.present();
    }, []);

    if (!data?.data) {
        return null;
    }
    const me = data.data;
    return (
        <>
            <View style={styles.upperWrap}>
                <Pressable onPress={openMultiAccountModal} style={styles.upperInnerWrap} hitSlop={hitSlop}>
                    <Text style={styles.username} weight={'700'}>
                        @{me.username}
                    </Text>
                    <Entypo name="chevron-down" style={styles.chevron} />
                </Pressable>
                <Pressable
                    onPress={() => {
                        openScanQRCodeModal();
                    }}>
                    <Feather name="share" size={24} color={theme.colors.textSecondary} />
                </Pressable>
                <Pressable
                    hitSlop={hitSlop}
                    onPress={() => {
                        navigate('Settings');
                    }}>
                    <Ionicons name="settings-outline" style={styles.settingsIcon} />
                </Pressable>
            </View>
            <View style={styles.profileWrap}>
                <Image
                    uri={me.thumbnail?.uri}
                    blurHash={me.thumbnail?.blurhash}
                    preset={'sm'}
                    style={styles.thumbnail}
                />
                <View style={styles.profileWrapRight}>
                    <Tag
                        onPress={() => {
                            navigation.navigate('EditProfile');
                        }}
                        containerStyle={styles.editProfile}
                        title={'Edit Profile'}
                        textStyle={styles.editText}
                        icon={<FontAwesome name="edit" size={18} color={theme.colors.textSecondary} />}
                    />
                    <Tag
                        onPress={() => {
                            navigation.navigate('RafikiList');
                        }}
                        containerStyle={styles.editProfile}
                        title={'Rafiki'}
                        textStyle={styles.editText}
                        icon={<FontAwesome5 name="user-friends" size={18} color={theme.colors.textSecondary} />}
                    />
                </View>
            </View>
            <Separator space={spacing.m} />
            <Text style={styles.name} weight={'600'}>
                {me.name}
            </Text>
            <Markdown>{me.bio}</Markdown>
            <ScanQRCodeModal mode={'share'} ref={scanQRCodeModal} />
        </>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        upperWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
        },
        upperInnerWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        username: {
            fontSize: 20,
            fontFamily: 'Font-700',
        },
        chevron: {
            marginLeft: spacing.s,
            color: theme.colors.textPrimary,
            fontSize: 20,
        },
        settingsIcon: {
            color: theme.colors.textPrimary,
            fontSize: 24,
        },
        profileWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.l,
        },
        profileWrapRight: {
            alignItems: 'flex-end',
        },
        editProfile: {
            backgroundColor: theme.colors.mainBackground,
            paddingHorizontal: 0,
            paddingVertical: spacing.s,
            borderWidth: 0,
        },
        editText: {
            fontFamily: 'Font-500',
            color: theme.colors.textSecondary,
        },
        thumbnail: {
            width: 100,
            height: 100,
            borderRadius: rounded.full,
        },
        name: {
            fontSize: 16,
        },
    });
