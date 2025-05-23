import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {RootStackScreenProps} from '@/navigation/types';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useLayoutEffect, useState} from 'react';
import {rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Image from '@/components/Image/Image';
import {ScrollView} from 'react-native-gesture-handler';
import {AntDesign, Entypo, Feather, FontAwesome6, MaterialIcons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Pressable from '@/components/Button/Pressable';
import {ChatItem} from './components/ChatItem';
import {chatSamples} from './components/chatsamples';
import {AddChat} from './components/AddChat';

type Tab = 'Chat' | 'Feed' | 'Vault' | 'Members';
type TabIconProps = {color: string; size: number};
const TABS: {title: Tab; icon: (props: TabIconProps) => React.ReactElement}[] = [
    {
        title: 'Feed',
        icon: ({color, size}: TabIconProps) => <MaterialIcons name="dynamic-feed" size={size} color={color} />,
    },
    {
        title: 'Chat',
        icon: ({color, size}: TabIconProps) => <Entypo name="chat" size={size} color={color} />,
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
    const [selectedTab, setSelectedTab] = useState<Tab>('Feed');
    const insets = useSafeAreaInsets();

    useLayoutEffect(() => {
        navigation.setOptions({
            title: route.params.name || '',
        });
    }, [route.params]);

    return (
        <View style={styles.container}>
            <Image uri={route.params.thumbnail} style={styles.coverImage} />
            <View style={[styles.navigationWrap, {top: insets.top}]}>
                <Pressable style={styles.navigationBack} onPress={navigation.goBack}>
                    <Feather name="arrow-left" style={styles.navigationBackIcon} />
                </Pressable>
            </View>
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

                {selectedTab === 'Feed' ? chatSamples.map((item, index) => <ChatItem key={index} {...item} />) : null}
            </ScrollView>
            {selectedTab === 'Feed' && <AddChat />}
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        navigationWrap: {
            position: 'absolute',
            left: 0,
            right: 0,
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: spacing.th,
            zIndex: 100,
        },
        navigationBack: {
            padding: spacing.m,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.mainBackground + '55',
            borderRadius: rounded.full,
        },
        navigationBackIcon: {
            fontSize: 18,
            color: theme.colors.textPrimary,
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
