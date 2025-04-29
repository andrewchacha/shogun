import React from 'react';
import {StyleSheet, StyleProp} from 'react-native';
import {Image as ExpoImage, ImageProps as ExpoImageProps} from 'expo-image';
import {ImageStyle as RNImageStyle} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import {getImageUriWithPreset, ImagePreset} from '@/utils/helper/imageUrl';

export type ImageProps = {
    blurHash?: string;
    uri?: string;
    style?: StyleProp<RNImageStyle>;
    preset?: ImagePreset;
} & ExpoImageProps;

const Image = React.memo(({uri, blurHash, style, preset = 'md'}: ImageProps) => {
    const source = uri ? {uri: getImageUriWithPreset(uri, preset)} : require('@/assets/no-image.jpeg');
    return (
        <ExpoImage
            source={source}
            style={[styles.image, style]}
            cachePolicy={'memory-disk'}
            placeholder={{blurhash: blurHash || ''}}
            allowDownscaling={true}
        />
    );
});

export default Image;

const styles = StyleSheet.create({
    image: {},
});
