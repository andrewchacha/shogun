import {Feather, FontAwesome5} from '@expo/vector-icons';
import {useAppTheme} from '@/hooks/utility/useAppTheme';
import {useThemeStyleSheetProvided} from '@/hooks/utility/useThemeStyleSheet';
import {isApiError} from '@/utils/helper/parser';
import {type AppTheme, palette, rounded, spacing} from '@/utils/styles';
import React, {useImperativeHandle, useLayoutEffect, useRef, useState, type MutableRefObject, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeInDown, FadeOutDown} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Text from '@/components/Text/Text';

type ToastProps = {
    title?: string;
    content: string;
    kind: 'success' | 'error' | 'info';
    autoHide?: boolean;
    timeout?: number;
};

export type ToastRef = {
    show: (props: ToastProps) => void;
    hide: () => void;
};

export class ToastController {
    static modalRef: MutableRefObject<ToastRef>;
    static setRef = (ref: any) => {
        this.modalRef = ref;
    };
    static show = (props: ToastProps) => {
        this.modalRef.current?.show(props);
    };
    static hide = () => {
        this.modalRef.current?.hide();
    };

    static showApiError(error: any, timeout?: number) {
        console.log('showApiError', error);
        let str = '';
        if (error instanceof TypeError) {
            str = 'Check your internet and try again';
        } else if (isApiError(error)) {
            str = `${error.status}:${error.error}`;
        } else if (typeof error === 'object') {
            str = JSON.stringify(error);
        } else {
            str = error.toString();
        }
        this.show({kind: 'error', title: 'Error', content: str, timeout});
    }
}

const Toast = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [props, setProps] = useState<ToastProps | null>(null);

    const timeout = useRef<any>();

    const modalRef = useRef<ToastRef>();
    useLayoutEffect(() => {
        ToastController.setRef(modalRef);
    }, []);

    useImperativeHandle(
        modalRef,
        () => ({
            show: (props: ToastProps) => {
                //resetting time again in case we double call this method.
                if (timeout.current) {
                    clearTimeout(timeout.current);
                }
                setProps(props);
                setModalVisible(true);
                let hideTime = props.timeout || 3000;
                if (props.autoHide === false) {
                    hideTime = 60000;
                }
                timeout.current = setTimeout(() => {
                    setModalVisible(false);
                }, hideTime);
            },
            hide: () => {
                setModalVisible(false);
                setProps(null);
            },
        }),
        [],
    );

    const insets = useSafeAreaInsets();
    const theme = useAppTheme();
    const styles = useThemeStyleSheetProvided(theme, dynamicStyles);

    const icon = useMemo(() => {
        switch (props?.kind) {
            case 'success':
                return <FontAwesome5 name="check-circle" style={styles.icon} />;
            case 'error':
                return <FontAwesome5 name="times" style={styles.icon} />;
            case 'info':
                return <Feather name="info" style={styles.icon} />;
        }
    }, [theme, props]);

    const bg = useMemo(() => {
        switch (props?.kind) {
            case 'success':
                return theme.colors.success;
            case 'error':
                return theme.colors.warning;
            case 'info':
                return palette.gray600;
        }
    }, [theme, props]);

    if (!modalVisible || !props) return null;
    return (
        <Animated.View
            entering={FadeInDown.duration(500)}
            exiting={FadeOutDown.duration(500)}
            style={[styles.toast, {bottom: insets.bottom + spacing.xl}]}>
            <View style={[styles.container, {backgroundColor: bg}]}>
                {icon}
                <View style={styles.midContainer}>
                    {props.title && <Text style={styles.title}>{props.title}</Text>}
                    {props.content && <Text style={styles.message}>{props.content}</Text>}
                </View>
            </View>
        </Animated.View>
    );
};

const dynamicStyles = (theme: AppTheme) =>
    StyleSheet.create({
        toast: {
            position: 'absolute',
            alignItems: 'center',
            right: 0,
            left: 0,
        },
        container: {
            backgroundColor: theme.colors.warning,
            borderRadius: rounded.xxl,
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: 350,
            minWidth: 200,
            padding: spacing.m,
            paddingHorizontal: spacing.l,
            alignSelf: 'center',
        },
        midContainer: {
            flex: 1,
            minWidth: 200,
            maxWidth: 300,
        },
        title: {
            fontFamily: 'Font-700',
            color: 'white',
        },
        message: {
            color: 'white',
            fontFamily: 'Font-500',
        },
        icon: {
            fontSize: 24,
            color: 'white',
            marginRight: spacing.l,
        },
    });

export default React.forwardRef(Toast);
