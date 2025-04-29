import {useAppTheme} from '@/hooks/utility/useAppTheme';
import Lottie from 'lottie-react-native';
import React, {useMemo} from 'react';
import {type StyleProp, View, type ViewStyle} from 'react-native';

interface Props {
    size: number;
    style?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    color?: string;
    noBorder?: boolean;
}

const LoadingGlobe = ({color, size, style, noBorder, containerStyle}: Props) => {
    const theme = useAppTheme();
    const colorFilter = color ? color : theme.colors.primary;

    const colors = [
        {keypath: 'Line Waves (1)', color: colorFilter},
        {keypath: 'Line Waves (2)', color: colorFilter},
        {keypath: 'Waves (1)', color: colorFilter},
        {keypath: 'Waves (2)', color: colorFilter},
        {keypath: 'Waves (3)', color: colorFilter},
        {keypath: 'Line Waves(1) 2', color: colorFilter},
        {keypath: 'Layer 3/lottie_radio Outlines', color: colorFilter},
        {keypath: 'Layer 3/lottie_radio Outlines', color: colorFilter},
        {keypath: 'Avatar "Border"', color: colorFilter},
        {keypath: 'Avatar Placeholder', color: colorFilter},
        {keypath: 'Shape 1', color: colorFilter},
        {keypath: 'Shape 2', color: colorFilter},
        {keypath: 'Shape 3', color: colorFilter},
    ];

    return (
        <View style={containerStyle}>
            {noBorder ? (
                <Lottie
                    style={[{width: size, height: size}, style]}
                    resizeMode="cover"
                    colorFilters={colors}
                    source={require('@/assets/animation/loading-slow-2.json')}
                    autoPlay
                    loop
                />
            ) : (
                <Lottie
                    style={[{width: size, height: size}, style]}
                    resizeMode="cover"
                    colorFilters={colors}
                    source={require('@/assets/animation/loading-slow.json')}
                    autoPlay
                    loop
                />
            )}
        </View>
    );
};

export default React.memo(LoadingGlobe);
