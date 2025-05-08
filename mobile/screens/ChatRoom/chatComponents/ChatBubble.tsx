import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, palette, rounded, spacing} from '@/utils/styles';
import {StyleSheet, View} from 'react-native';
import Text from '@/components/Text/Text';
import {ChatImages} from '@/screens/ChatRoom/chatComponents/ChatImages';
import {CryptoRequest} from '@/screens/ChatRoom/chatComponents/CryptoRequest';

type Props = {
    senderID: string;
    images?: string[];
    message: string;
    cryptoRequest?: boolean;
};

export function ChatBubble({senderID, images, message, cryptoRequest}: Props) {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const isSender = senderID == 'me';
    if (isSender) {
        return (
            <View style={styles.container}>
                <View style={styles.bubbleMine}>
                    {message && <Text style={styles.messageMine}>{message}</Text>}
                    {images && <ChatImages images={images} />}
                    {cryptoRequest && <CryptoRequest />}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                {message && <Text style={styles.message}>{message}</Text>}
                {images && <ChatImages images={images} />}
                {cryptoRequest && <CryptoRequest />}
            </View>
        </View>
    );
}

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            marginTop: spacing.s,
        },
        bubble: {
            // backgroundColor: theme.isDark ? '#2E2E2E' : '#E9E9E9',
            backgroundColor: theme.colors.cardBackground,
            borderRadius: rounded.xl,
            maxWidth: '90%',
        },
        bubbleMine: {
            alignSelf: 'flex-end',
            // backgroundColor: theme.isDark ? '#0D57EF' : '#165DEF',
            backgroundColor: theme.isDark ? palette.sky800 : palette.sky600,
            borderRadius: rounded.xl,
            maxWidth: '90%',
        },
        message: {
            padding: spacing.m,
            fontSize: 16,
        },
        messageMine: {
            color: palette.white,
            padding: spacing.m,
            fontSize: 16,
        },
    });
