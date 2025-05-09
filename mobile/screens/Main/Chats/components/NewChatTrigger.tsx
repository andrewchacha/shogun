import React, {memo, ReactNode, useCallback, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';
import Pressable from '@/components/Button/Pressable';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme} from '@/utils/styles';
import SearchNewAddressModal from '@/screens/Main/Chats/components/SearchNewAddressModal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import ContactPickerModal from '@/components/ContactPickerModal/ContactPickerModal';

type Props = {
    children: ReactNode;
    onScanQrCode: () => void;
};

export const NewChatTrigger = memo(({children, onScanQrCode}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const searchNewAddressModal = useRef<BottomSheetModal>(null);
    const openSearchNewAddressModal = useCallback(() => {
        searchNewAddressModal.current?.present();
    }, []);

    const contactPickerModal = useRef<BottomSheetModal>(null);
    const openContactPickerModal = useCallback(() => {
        contactPickerModal.current?.present();
    }, []);

    return (
        <View>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Pressable>{children}</Pressable>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    <DropdownMenu.Item key={'add'} onSelect={openSearchNewAddressModal}>
                        <DropdownMenu.ItemTitle>New Address</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item key={'contact'} onSelect={openContactPickerModal}>
                        <DropdownMenu.ItemTitle>Contact List</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item key={'scan'} onSelect={onScanQrCode}>
                        <DropdownMenu.ItemTitle>Scan QR Code</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
            <SearchNewAddressModal ref={searchNewAddressModal} />
            <ContactPickerModal ref={contactPickerModal} />
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) => StyleSheet.create({});
