import {memo} from 'react';
import {FeedDataVote} from './chatsamples';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import {palette, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Separator from '@/components/Separator/Separator';
import Button from '@/components/Button/Button';

const FOR_COLOR = palette.teal500;
const AGAINST_COLOR = palette.rose500;
const ABSTAIN_COLOR = palette.violet500;
export const VoteItem = memo(({address, title, for_votes, against_votes, abstain_votes}: FeedDataVote) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const totalVotes = for_votes + against_votes + abstain_votes;
    const forWidth = totalVotes > 0 ? for_votes / totalVotes : 0;
    const againstWidth = totalVotes > 0 ? against_votes / totalVotes : 0;
    const abstainWidth = totalVotes > 0 ? abstain_votes / totalVotes : 0;

    return (
        <View style={styles.container}>
            <View style={styles.docWrap}>
                <Ionicons name="document-attach-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.graph}>
                <View style={[styles.progress, {width: `${forWidth * 100}%`, backgroundColor: FOR_COLOR}]} />
                <View style={[styles.progress, {width: `${againstWidth * 100}%`, backgroundColor: AGAINST_COLOR}]} />
                <View style={[styles.progress, {width: `${abstainWidth * 100}%`, backgroundColor: ABSTAIN_COLOR}]} />
            </View>
            <View style={styles.graphData}>
                <View style={[styles.bubble, {backgroundColor: FOR_COLOR}]}></View>
                <Text style={styles.graphInfo}>For </Text>
                <Text style={styles.graphInfo}>
                    {for_votes} ({Math.floor(forWidth * 100)}%)
                </Text>
                <Separator space={spacing.m} horizontal={true} />
                <View style={[styles.bubble, {backgroundColor: AGAINST_COLOR}]}></View>
                <Text style={styles.graphInfo}>Against </Text>
                <Text style={styles.graphInfo}>
                    {against_votes} ({Math.floor(againstWidth * 100)}%)
                </Text>
                <Separator space={spacing.m} horizontal={true} />
                <View style={[styles.bubble, {backgroundColor: ABSTAIN_COLOR}]}></View>
                <Text style={styles.graphInfo}>Abstain </Text>
                <Text style={styles.graphInfo}>
                    {abstain_votes} ({Math.floor(abstainWidth * 100)}%)
                </Text>
            </View>

            <Separator space={spacing.l} />
            <Button title={'Vote'} onPress={() => {}} />
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            width: '100%',
        },
        docWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.m,
            padding: spacing.m,
            borderRadius: rounded.l,
            borderColor: palette.violet500,
            borderWidth: 3,
            backgroundColor: theme.colors.cardBackground,
            boxShadow: '0px 4px 18px rgba(127, 17, 224, 0.15)',
        },
        title: {
            flex: 1,
        },
        progress: {
            height: 20,
        },
        graph: {
            marginTop: spacing.m,
            flexDirection: 'row',
            width: '100%',
            backgroundColor: 'red',
            borderRadius: rounded.l,
            height: 20,
            overflow: 'hidden',
        },
        bubble: {
            height: 14,
            width: 14,
            borderRadius: 7,
            marginRight: spacing.xs,
        },
        graphData: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.m,
        },
        graphInfo: {
            fontSize: 12,
        },
    });
