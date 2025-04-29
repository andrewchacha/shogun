import React from 'react';
import {Pressable as NativePressable, Platform, StyleProp, ViewStyle, PressableProps} from 'react-native';

interface Props extends PressableProps {
    style?: StyleProp<ViewStyle>;
    touchOpacity?: number;
}

const Pressable = ({
    style,
    android_ripple = {color: 'lightgrey'},
    touchOpacity = 0.5,
    children,
    ...restOfProps
}: Props) => {
    return (
        <NativePressable
            style={({pressed}) => [
                style,
                {
                    opacity: Platform.OS !== 'android' && pressed ? touchOpacity : 1,
                },
            ]}
            android_ripple={android_ripple}
            {...restOfProps}>
            {children}
        </NativePressable>
    );
};
export default Pressable;
