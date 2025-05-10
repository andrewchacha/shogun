import {StyleSheet, View, ViewStyle} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme} from '@/utils/styles';
import Text from '@/components/Text/Text';
import Pressable from '@/components/Button/Pressable';
import * as Haptics from 'expo-haptics';
import {AntDesign} from '@expo/vector-icons';

const specialValues = {
    separator: -1,
    backspace: -2,
};
type specialValues = (typeof specialValues)[keyof typeof specialValues];
type values = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 | specialValues;

const decimalSeparator = '.';
const numbers: {label: string; value: values}[][] = [
    [
        {label: '1', value: 1},
        {label: '2', value: 2},
        {label: '3', value: 3},
    ],
    [
        {label: '4', value: 4},
        {label: '5', value: 5},
        {label: '6', value: 6},
    ],
    [
        {label: '7', value: 7},
        {label: '8', value: 8},
        {label: '9', value: 9},
    ],
    [
        {label: decimalSeparator, value: specialValues.separator},
        {label: '0', value: 0},
        {label: '<', value: specialValues.backspace},
    ],
];

type Props = {
    containerStyle?: ViewStyle;
    onBackspace: () => void;
    onNumber: (value: number) => void;
    onDecimalSeparator: () => void;
};

export const NumberKeyboard = ({containerStyle, onBackspace, onNumber, onDecimalSeparator}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const onPress = (value: values) => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (value === specialValues.separator) {
            onDecimalSeparator();
            return;
        }
        if (value === specialValues.backspace) {
            onBackspace();
            return;
        }
        onNumber(value);
    };
    return (
        <View style={[styles.container, containerStyle]}>
            {numbers.map((row, i) => (
                <View key={i} style={styles.container}>
                    {row.map((number, j) => (
                        <Pressable
                            key={j}
                            style={styles.button}
                            onPress={() => {
                                onPress(number.value);
                            }}>
                            {number.value === specialValues.separator ? (
                                <Text style={styles.buttonText}>{decimalSeparator}</Text>
                            ) : number.value === specialValues.backspace ? (
                                <AntDesign name="arrowleft" style={styles.buttonText} />
                            ) : (
                                <Text style={styles.buttonText}>{number.label}</Text>
                            )}
                        </Pressable>
                    ))}
                </View>
            ))}
        </View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        button: {
            width: '33%',
            height: 64,
            justifyContent: 'center',
            alignItems: 'center',
        },
        buttonText: {
            fontSize: 24,
            fontFamily: 'Font-500',
            color: theme.colors.textSecondary,
        },
    });
