import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Lottie from 'lottie-react-native';
import type React from 'react';
import {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

interface Props {
    size?: 'small' | 'large' | 'medium';
    isLoading: boolean;
    style?: StyleProp<ViewStyle>;
    color?: string;
}

const SIZE = {
    small: 20,
    medium: 32,
    large: 48,
};

const Loading: React.FC<Props> = ({isLoading, color, size = 'medium', style}) => {
    const wh = SIZE[size];
    const theme = useAppTheme();

    const colorFilter = useMemo(() => {
        if (color) return color;
        return theme.colors.primary;
    }, [color, theme]);

    if (!isLoading) return null;
    return (
        <Lottie
            style={[{width: wh, height: wh}, style]}
            resizeMode="cover"
            colorFilters={colorFilter ? [{keypath: 'circle_group', color: colorFilter}] : []}
            source={require('@/assets/animation/loading-spinner.json')}
            autoPlay
            loop
        />
    );
};

export default Loading;
