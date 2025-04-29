import React from 'react';
import {MotiView} from 'moti';
import {StyleProp, ViewStyle} from 'react-native';

const BlinkingCursor = ({
    color,
    height,
    containerStyle,
}: {
    color: string;
    height: number;
    containerStyle?: StyleProp<ViewStyle>;
}) => {
    return (
        <MotiView
            from={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: 500,
                loop: true,
                repeatReverse: true,
                type: 'timing',
            }}
            style={[
                {
                    width: 2,
                    height: height,
                    backgroundColor: color,
                },
                containerStyle,
            ]}
        />
    );
};

export default BlinkingCursor;
