import BigNumber from 'bignumber.js';
import * as Haptics from 'expo-haptics';
import {SetStateAction} from 'react';

type Props = {
    tokenBalance: BigNumber;
    tokenDecimals: number;
    amount: string;
    setAmount: (value: SetStateAction<string>) => void;
};

export function useKeyboardHandler({tokenBalance, tokenDecimals, amount, setAmount}: Props) {
    const decimalSeparator = '.';
    const onKeyboardNumberPress = (value: number) => {
        if (new BigNumber(amount || 0).isGreaterThan(tokenBalance)) {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }
        setAmount(prev => {
            if (prev === '0') {
                return `${value}`;
            }
            const newValue = `${prev}${value}`;
            if (countDecimals(newValue, decimalSeparator) > tokenDecimals) {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                return prev;
            }
            return newValue;
        });
    };

    const onDecimalSeparator = () => {
        setAmount(prev => {
            if (prev.includes(decimalSeparator)) {
                return `${prev}`;
            }
            return `${prev}${decimalSeparator}`;
        });
    };

    const onBackspace = () => {
        setAmount(prev => {
            if (prev.length === 1) {
                return '0';
            }
            return prev.slice(0, -1);
        });
    };

    return {onKeyboardNumberPress, onDecimalSeparator, onBackspace};
}

function countDecimals(numStr: string, separator: string): number {
    const parts = numStr.split(separator);
    if (parts.length < 2) {
        return 0;
    }
    return parts[1].length;
}
