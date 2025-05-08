import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {CommonStackScreenProps} from '@/navigation/types';
import React, {useLayoutEffect} from 'react';
import {StyleSheet, View, ScrollView, Switch, FlatList} from 'react-native';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import LoadingGlobe from '@/components/LoadingGlobe/LoadingGlobe';
import Button from '@/components/Button/Button';
import Pressable from '@/components/Button/Pressable';
import {AntDesign} from '@expo/vector-icons';
import Separator from '@/components/Separator/Separator';

const AddressBook = ({navigation}: CommonStackScreenProps<'AddressBook'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: 'Address Book',
            headerRight: () => (
                <Pressable>
                    <AntDesign name="plus" style={styles.plusIcon} />
                </Pressable>
            ),
        });
    }, [theme.scheme]);

    const data: string[] = ['hi'];
    return (
        <FlatList
            ListHeaderComponent={
                <View style={styles.header}>
                    <LoadingGlobe
                        size={200}
                        noBorder={true}
                        color={theme.colors.textSecondary}
                        containerStyle={styles.globe}
                    />
                    <Text style={styles.emptyText}>
                        Your address book is empty.{'\n'}Add new address to save it in your device.
                    </Text>
                    <Text style={styles.emptyText2}>
                        Address Book data is only stored locally, and synced across your devices using end to end
                        encryption.
                    </Text>
                    nim
                </View>
            }
            contentContainerStyle={styles.container}
            keyExtractor={item => item}
            renderItem={() => null}
            showsVerticalScrollIndicator={false}
            data={data}
        />
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginHorizontal: spacing.th,
            paddingVertical: spacing.th,
            paddingBottom: spacing.xxl,
        },
        plusIcon: {
            fontSize: 24,
            color: theme.colors.textPrimary,
        },
        header: {},
        globe: {
            alignItems: 'center',
        },
        emptyText: {
            fontFamily: 'Font-500',
            textAlign: 'center',
        },
        emptyText2: {
            color: theme.colors.textSecondary,
            marginTop: spacing.m,
            textAlign: 'center',
        },
    });

export default AddressBook;
