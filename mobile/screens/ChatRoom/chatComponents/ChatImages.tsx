import {memo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {AppTheme, rounded, spacing} from '@/utils/styles';
import Image from '@/components/Image/Image';

type Props = {
    images?: string[];
};

export const ChatImages = memo(({images}: Props) => {
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    if (!images) return null;
    return (
        <View>
            {images.length === 1 && <Image uri={images[0]} style={styles.imageSingle} />}
            {images.length === 2 && (
                <View style={styles.twoWrapper}>
                    <Image uri={images[0]} style={[styles.imageTwo]} />
                    <Image uri={images[1]} style={[styles.imageTwo]} />
                </View>
            )}
            {images.length === 3 && (
                <View style={styles.threeWrapper}>
                    <Image uri={images[0]} style={[styles.imageThree]} />
                    <View style={styles.threeWrapperInner}>
                        <Image uri={images[1]} style={[styles.imageThreeInner]} />
                        <Image uri={images[2]} style={[styles.imageThreeInner]} />
                    </View>
                </View>
            )}
            {images.length === 4 && <View></View>}
        </View>
    );
});

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        imageSingle: {
            borderBottomLeftRadius: rounded.xl,
            borderBottomRightRadius: rounded.xl,
            margin: 2,
            height: 300,
        },
        twoWrapper: {
            flexDirection: 'row',
            borderRadius: rounded.xl,
            overflow: 'hidden',
            margin: 2,
            gap: spacing.xs,
        },
        imageTwo: {
            height: 200,
            flexGrow: 1,
        },
        threeWrapper: {
            flexDirection: 'row',
            borderRadius: rounded.xl,
            overflow: 'hidden',
            margin: 2,
            gap: 2,
        },
        threeWrapperInner: {
            gap: 2,
            flex: 1,
        },
        imageThree: {
            height: 300,
            flex: 1,
        },
        imageThreeInner: {
            flex: 1,
            gap: 3,
        },
    });
