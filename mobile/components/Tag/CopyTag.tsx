import Success from '@/components/Success/Success';
import {Feather} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {palette, spacing} from '@/utils/styles';
import * as Clipboard from 'expo-clipboard';
import Lottie from 'lottie-react-native';
import type React from 'react';
import {useState} from 'react';
import {type StyleProp, StyleSheet, type ViewStyle} from 'react-native';
import Tag from './Tag';

interface Props {
    content: string;
    containerStyle?: StyleProp<ViewStyle>;
}

const CopyTag: React.FC<Props> = ({content, containerStyle}) => {
    const [success, setSuccess] = useState(false);
    const onCopy = async () => {
        await Clipboard.setStringAsync(content);
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 3000);
    };
    const renderIcon = () => {
        if (success) {
            return <Success size={48} />;
        }
        return <Feather name="copy" style={styles.feather} />;
    };

    return <Tag icon={renderIcon()} title="Copy" onPress={onCopy} containerStyle={containerStyle} />;
};

const styles = StyleSheet.create({
    lottie: {
        width: 18,
        height: 18,
        marginRight: spacing.s,
    },
    feather: {
        fontSize: 18,
        marginRight: spacing.s,
        color: palette.yellow500,
    },
});

export default CopyTag;
