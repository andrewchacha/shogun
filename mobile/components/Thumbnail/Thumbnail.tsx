import React from 'react';
import {Image, ImageContentFit, ImageSource, ImageStyle} from 'expo-image';
import {ImageSourcePropType, StyleProp} from 'react-native';
import Jazzicon from '@/components/Jazzicon/Jazzicon';

interface Props {
    id: string;
    uri?: string;
    contentFit?: ImageContentFit;
    size?: number;
    radius?: number;
    containerStyle?: StyleProp<ImageStyle>;
}

const SIZE = 70;
const RADIUS = 24;

export const Thumbnail: React.FC<Props> = ({id, size = SIZE, radius = RADIUS, uri, containerStyle, contentFit}) => {
    if (!uri) {
        return <Jazzicon address={id} containerStyle={containerStyle} size={size} radius={radius} />;
    }
    return (
        <Image
            allowDownscaling={true}
            cachePolicy={'memory-disk'}
            source={{uri: uri}}
            contentFit={contentFit}
            style={[{width: size, height: size, borderRadius: radius}, containerStyle]}
        />
    );
};

export default Thumbnail;
