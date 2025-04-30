import {Ionicons} from '@expo/vector-icons';
import React from 'react';
import {useMe} from '@/hooks/api/useMe';
import Image from '@/components/Image/Image';
import {tabStyles} from '@/navigation/shared';
import {View} from 'react-native';

type Props = {
    color: string;
    focused: boolean;
    size: number;
};

export const TabMyProfile = React.memo(({color, focused, size}: Props) => {
    const {data} = useMe(false);
    const hasThumbnail = !!data?.data?.thumbnail?.uri;

    return (
        <View pointerEvents={'none'}>
            {hasThumbnail ? (
                <Image
                    uri={data?.data?.thumbnail?.uri}
                    blurHash={data?.data?.thumbnail?.blurhash}
                    style={{
                        opacity: focused ? 1 : 0.5,
                        width: size,
                        height: size,
                        borderRadius: size,
                    }}
                />
            ) : focused ? (
                <Ionicons name="person" size={size} color={color} style={tabStyles.icon} />
            ) : (
                <Ionicons name="person-outline" size={size} color={color} style={tabStyles.icon} />
            )}
        </View>
    );
});
