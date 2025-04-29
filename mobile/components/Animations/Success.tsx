import {palette, spacing} from '@/utils/styles';
import Lottie from 'lottie-react-native';
import React from 'react';

type Props = {
    checkColor?: string;
    bgColor?: string;
    size?: number;
};
export const Success = React.memo(({checkColor = 'white', bgColor = palette.teal500, size = 32}: Props) => {
    return (
        <Lottie
            colorFilters={[
                {keypath: 'check', color: checkColor},
                {keypath: 'Shape Layer 1', color: bgColor},
                {keypath: 'Shape Layer 2', color: bgColor},
            ]}
            style={[{width: size, height: size}]}
            resizeMode="cover"
            source={require('@/assets/animation/success.json')}
            autoPlay
            loop={false}
        />
    );
});
