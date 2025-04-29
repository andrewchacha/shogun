import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheet} from '@/hooks/utility/useThemeStyleSheet';
import Lottie from 'lottie-react-native';
import type React from 'react';

interface Props {
    size?: number;
    color?: string;
    tickColor?: string;
    loop?: boolean;
}

const Success: React.FC<Props> = ({size = 32, color, tickColor, loop = false}) => {
    const theme = useAppTheme();

    const bg = color || theme.colors.success;
    const bgLight = color ? color + '55' : theme.colors.success + '55';

    const tk = tickColor || theme.colors.white;

    return (
        <Lottie
            style={{width: size, height: size}}
            resizeMode="cover"
            colorFilters={[
                {keypath: 'check', color: tk},
                {keypath: 'Shape Layer 1', color: bgLight},
                {keypath: 'Shape Layer 2', color: bg},
            ]}
            source={require('@assets/animation/success.json')}
            autoPlay
            loop={loop}
        />
    );
};

export default Success;
