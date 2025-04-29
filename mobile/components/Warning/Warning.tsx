import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Lottie from 'lottie-react-native';
import React from 'react';

interface Props {
    size?: number;
    color?: string;
    outlineColor?: string;
}

const Warning = React.memo(({size = 32, color, outlineColor = '#FFFFFF'}: Props) => {
    const theme = useAppTheme();
    const c = color || theme.colors.warning;
    return (
        <Lottie
            style={{width: size, height: size}}
            resizeMode="cover"
            colorFilters={[
                {keypath: 'Layer 1 Outlines', color: c},
                {keypath: 'Layer 2 Outlines', color: c},
                {keypath: 'Layer 3 Outlines', color: outlineColor},
                {keypath: 'Layer 4 Outlines', color: outlineColor},
                {keypath: 'Layer 5 Outlines', color: c},
            ]}
            source={require('@assets/animation/warning.json')}
            autoPlay
            loop
        />
    );
});

export default Warning;
