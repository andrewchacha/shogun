import {useKeyboardHandler} from 'react-native-keyboard-controller';
import {useAnimatedScrollHandler, useSharedValue} from 'react-native-reanimated';

export const useKeyboardAnimation = () => {
    const progress = useSharedValue(0);
    const height = useSharedValue(0);
    const inset = useSharedValue(0);
    const offset = useSharedValue(0);
    const scroll = useSharedValue(0);
    const shouldUseOnMoveHandler = useSharedValue(false);

    useKeyboardHandler({
        onStart: e => {
            'worklet';

            // i. e. the keyboard was under interactive gesture, and will be showed
            // again. Since iOS will not schedule layout animation for that we can't
            // simply update `height` to destination and we need to listen to `onMove`
            // handler to have a smooth animation
            if (progress.value !== 1 && progress.value !== 0 && e.height !== 0) {
                shouldUseOnMoveHandler.value = true;
                return;
            }

            progress.value = e.progress;
            height.value = e.height;

            inset.value = e.height;
            // Math.max is needed to prevent overscroll when keyboard hides (and user scrolled to the top, for example)
            offset.value = Math.max(e.height + scroll.value, 0);
        },
        onInteractive: e => {
            'worklet';

            progress.value = e.progress;
            height.value = e.height;
        },
        onMove: e => {
            'worklet';

            if (shouldUseOnMoveHandler.value) {
                progress.value = e.progress;
                height.value = e.height;
            }
        },
        onEnd: e => {
            'worklet';

            height.value = e.height;
            progress.value = e.progress;
            shouldUseOnMoveHandler.value = false;
        },
    });

    const onScroll = useAnimatedScrollHandler({
        onScroll: e => {
            scroll.value = e.contentOffset.y - inset.value;
        },
    });

    return {height, progress, onScroll, inset, offset};
};
