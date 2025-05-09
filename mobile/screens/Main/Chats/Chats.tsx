import React, {useCallback, useRef} from 'react';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import {hitSlop, rounded, spacing} from '@/utils/styles';
import type {AppTheme} from '@/utils/styles/theme';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import {Search} from '@/screens/Main/Chats/Search';
import {Statuses} from '@/screens/Main/Chats/Statuses';
import Separator from '@/components/Separator/Separator';
import {Inbox} from '@/screens/Main/Chats/Inbox';
import Tag from '@/components/Tag/Tag';
import {MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import {NewChatTrigger} from '@/screens/Main/Chats/components/NewChatTrigger';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import ScanQRCodeModal from '@/components/ScanQRCodeModal/ScanQRCodeModal';

const Chats = ({navigation}: CommonStackScreenProps<'Chats'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const scanQrCodeModal = useRef<BottomSheetModal>(null);
    const onScanQrCode = useCallback(() => {
        scanQrCodeModal.current?.present();
    }, []);

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.chatsHeadWrap}>
                    <Text variant={'subheader'}>Chats</Text>
                    <View style={{flex: 1}} />
                    <NewChatTrigger onScanQrCode={onScanQrCode}>
                        <MaterialCommunityIcons name="chat-plus" style={styles.topActionIcon} />
                    </NewChatTrigger>
                    <Pressable hitSlop={hitSlop} onPress={onScanQrCode}>
                        <MaterialCommunityIcons name="qrcode-scan" style={styles.topActionIcon} />
                    </Pressable>
                </View>
                <Separator space={spacing.l} />
                <Search />
                <Separator space={spacing.l} />
                <Text variant={'subheader'}>Updates</Text>
                <Separator space={spacing.m} />
                <Statuses />
                <Separator space={spacing.xl} />
                <View style={styles.subheadWrap}>
                    <Text variant={'subheader'}>Inbox</Text>
                    <Tag
                        onPress={() => navigation.navigate('ChatRequests')}
                        title={'20 Requests'}
                        textStyle={styles.requestText}
                        icon={<Octicons name="people" style={styles.requestIcon} />}
                    />
                </View>
                <Separator space={spacing.m} />
                <Inbox />
            </ScrollView>
            <ScanQRCodeModal mode={'scan'} ref={scanQrCodeModal} />
        </SafeAreaView>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        safeAreaView: {
            flex: 1,
        },
        scrollView: {
            marginHorizontal: spacing.th,
        },
        balanceCard: {
            ...theme.cardVariants.simple,
            padding: spacing.l,
        },
        totalBalance: {
            fontSize: 32,
            marginTop: spacing.s,
        },
        actionButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.l,
        },
        actionWrap: {
            padding: spacing.l,
            borderRadius: rounded.full,
            justifyContent: 'center',
            alignItems: 'center',
            height: 60,
            width: 60,
        },
        chatsHeadWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.l,
        },
        topActionIcon: {
            fontSize: 24,
            color: theme.colors.textSecondary,
        },
        subheadWrap: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        requestIcon: {
            color: theme.colors.textSecondary,
            fontSize: 14,
        },
        requestText: {
            color: theme.colors.textSecondary,
            fontSize: 12,
        },
    });

export default Chats;
