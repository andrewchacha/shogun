import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import type {AppTheme} from '@/utils/styles/theme';
import React, {useState} from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {rounded, spacing} from '@/utils/styles';
import Image from '@/components/Image/Image';
import {useMe} from '@/hooks/api/useMe';
import {FontAwesome} from '@expo/vector-icons';
import Pressable from '@/components/Button/Pressable';
import * as ImagePicker from 'expo-image-picker';
import {Image as ImageCompressor} from 'react-native-compressor';
import Loading from '@/components/Loading/Loading';
import {apiUploadThumbnail} from '@/utils/api/userThumbnail';
import {Image as ExpoImage} from 'react-native';
import {getImageUriWithPreset} from '@/utils/helper/imageUrl';
import {ToastController} from '@/components/Toast/Toast';

export const ThumbnailChanger = () => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);
    const {data, refetch} = useMe(false);
    const [isUploading, setUploading] = useState(false);
    const [filePath, setFilePath] = useState<string | null>(null);

    const onPickImage = async () => {
        const readPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
        if (!readPermission.granted) {
            if (!readPermission.canAskAgain) {
                void Linking.openSettings();
                return;
            }
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                return;
            }
        }

        let pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
            exif: true,
            allowsMultipleSelection: false,
        });
        if (pickerResult.canceled || pickerResult.assets.length === 0) {
            return;
        }

        try {
            setUploading(true);
            const asset = pickerResult.assets[0];
            let filePath = asset.uri;
            let mimeType = asset?.mimeType;
            if ((asset?.fileSize || 0) / 1024 / 1024 > 1) {
                filePath = await ImageCompressor.compress(asset.uri, {
                    returnableOutputType: 'uri',
                    compressionMethod: 'auto',
                    maxWidth: 1024,
                    maxHeight: 1024,
                    quality: 0.98,
                });
                mimeType = 'image/jpeg';
            }
            setFilePath(filePath);
            const res = await apiUploadThumbnail({
                uri: filePath,
                mimeType: mimeType || 'image/jpeg',
            });
            if (res.data?.uri) {
                void refetch();
                void ExpoImage.prefetch(getImageUriWithPreset(res.data.uri, 'sm'));
                void ExpoImage.prefetch(getImageUriWithPreset(res.data.uri, 'md'));
                void ExpoImage.prefetch(getImageUriWithPreset(res.data.uri, 'lg'));
            }
        } catch (error) {
            setFilePath(null);
            ToastController.show({
                content: 'There was an error! Try again',
                kind: 'error',
            });
        } finally {
            setUploading(false);
        }
    };

    if (!data?.data) {
        return null;
    }
    const me = data.data;
    return (
        <Pressable style={styles.imageWrap} onPress={onPickImage}>
            <Image
                uri={filePath ? filePath : me.thumbnail?.uri}
                blurHash={me.thumbnail?.blurhash}
                style={styles.thumbnail}
            />
            <View style={styles.photoWrap}>
                {isUploading ? <Loading isLoading={true} /> : <FontAwesome name="photo" style={styles.photoIcon} />}
            </View>
        </Pressable>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        imageWrap: {
            marginTop: spacing.l,
            alignSelf: 'center',
        },
        thumbnail: {
            width: 120,
            height: 120,
            borderRadius: 120,
        },
        photoWrap: {
            ...theme.cardVariants.tag,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: rounded.full,
            padding: spacing.s,
            position: 'absolute',
            bottom: 0,
            right: 0,
        },
        photoIcon: {
            color: theme.colors.textPrimary,
            fontSize: 18,
        },
    });
