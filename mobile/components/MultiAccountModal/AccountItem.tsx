import {View, StyleSheet} from 'react-native';
import Text from '@/components/Text/Text';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import Image from '@/components/Image/Image';
import {FontAwesome5} from '@expo/vector-icons';
import {useAuthAccountExists} from '@/hooks/api/useAuthAccountExists';
import Loading from '@/components/Loading/Loading';
import Pressable from '@/components/Button/Pressable';
import {navigateDispatch} from '@/navigation/shared';
import {CommonActions} from '@react-navigation/native';
import {DBAccount, getAccountStore} from '@/storage/accountStore';
import {useCurrentAccountID} from '@/storage/accountStoreHooks';

type Props = DBAccount & {
    onClose: () => void;
};

export const AccountItem = ({id, path_index, onClose}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const currentAccountID = useCurrentAccountID();

    const switchAccount = () => {
        if (id === currentAccountID) {
            onClose();
            return;
        }
        getAccountStore().setCurrentAccountID(id);
        navigateDispatch(CommonActions.reset({index: 1, routes: [{name: 'Main'}]}));
        onClose();
    };

    const {data, isLoading} = useAuthAccountExists(id);
    return (
        <Pressable
            style={[styles.container, id === currentAccountID && styles.containerActive]}
            onPress={switchAccount}>
            <Image
                uri={data?.data?.thumbnail?.uri}
                blurHash={data?.data?.thumbnail?.blurhash}
                style={styles.thumbnail}
            />
            <Text>{data?.data?.username ? `@${data.data.username}` : id}</Text>
            <View style={{flex: 1}} />
            {id === currentAccountID ? (
                <FontAwesome5 name="check-circle" size={20} color={theme.colors.textPrimary} />
            ) : (
                <Text style={styles.index}>/{path_index}/</Text>
            )}
            <Loading isLoading={isLoading} />
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            ...theme.cardVariants.simple,
            marginTop: spacing.s,
            padding: spacing.l,
            borderRadius: rounded.l,
            flexDirection: 'row',
            alignItems: 'center',
        },
        containerActive: {
            borderColor: theme.colors.primary,
            borderWidth: 1,
        },
        thumbnail: {
            marginRight: spacing.m,
            borderRadius: rounded.full,
            height: 36,
            width: 36,
        },
        index: {
            color: theme.colors.textTertiary,
            marginRight: spacing.xs,
            fontSize: 12,
        },
    });
