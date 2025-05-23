import {BottomSheetBackdropProps, useBottomSheet} from '@gorhom/bottom-sheet';
import {Pressable} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ModalBackdrop = ({style}: BottomSheetBackdropProps) => {
    const {close} = useBottomSheet();
    return (
        <AnimatedPressable
            onPress={() => close()}
            entering={FadeIn.duration(20)}
            exiting={FadeOut.duration(10)}
            style={[style, {backgroundColor: 'rgba(0, 0, 0, 0.65)'}]}
        />
    );
};
