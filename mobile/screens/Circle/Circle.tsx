import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {rounded, spacing} from '@/utils/styles';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Image from '@/components/Image/Image';
import {ScrollView} from 'react-native-gesture-handler';
import {Entypo, FontAwesome6, MaterialIcons} from '@expo/vector-icons';

type Tab = 'Chat' | 'Feed' | 'Vault' | 'Members';
type TabIconProps = {color: string; size: number};
const TABS: {title: Tab; icon: (props: TabIconProps) => React.ReactElement}[] = [
    {
        title: 'Chat',
        icon: ({color, size}: TabIconProps) => <Entypo name="chat" size={size} color={color} />,
    },
    {
        title: 'Feed',
        icon: ({color, size}: TabIconProps) => <MaterialIcons name="dynamic-feed" size={size} color={color} />,
    },
    {
        title: 'Vault',
        icon: ({color, size}: TabIconProps) => <FontAwesome6 name="vault" size={size} color={color} />,
    },
    {
        title: 'Members',
        icon: ({color, size}: TabIconProps) => <FontAwesome6 name="people-roof" size={size} color={color} />,
    },
];

const Circle = ({navigation, route}: RootStackScreenProps<'Circle'>) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const [selectedTab, setSelectedTab] = useState<Tab>('Chat');

    const nav = useNavigation();
    useLayoutEffect(() => {
        nav.setOptions({
            title: route.params.name || '',
        });
    }, [route.params]);

    return (
        <View style={styles.container}>
            <Image uri={route.params.thumbnail} style={styles.coverImage} />
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <Text variant="header">{route.params.name}</Text>
                <Text>
                    Bring your brother, bring your sister, bring your friend, bring your grandma, we are going to the
                    moon.
                </Text>
                <View style={styles.tabs}>
                    {TABS.map((tab, index) => (
                        <Pressable
                            key={index}
                            style={[styles.tab, tab.title === selectedTab ? styles.tabSelected : {}]}
                            onPress={() => {
                                setSelectedTab(tab.title);
                            }}>
                            {tab.icon({
                                color: tab.title === selectedTab ? theme.colors.textPrimary : theme.colors.textTertiary,
                                size: 24,
                            })}
                        </Pressable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        coverImage: {
            width: '100%',
            height: 450,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        },
        contentContainer: {
            marginTop: 420,
            paddingVertical: spacing.l,
            paddingHorizontal: spacing.th,
            backgroundColor: theme.colors.mainBackground,
            borderTopLeftRadius: rounded.xl,
            borderTopRightRadius: rounded.xl,
        },
        tabs: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.l,
        },
        tab: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: spacing.m,
        },
        tabSelected: {
            borderBottomWidth: 2,
            borderColor: theme.colors.border,
        },
    });

export default Circle;
