import {StyleSheet} from 'react-native';
import {rounded} from './constants';
import {palette} from './palette';

export type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
export type FontColors = 'primary' | 'secondary' | 'tertiary';

const LIGHT_BACKGROUND = '#EEF2F5';

const COLORS_LIGHT = {
    primary: palette.black,
    secondaryAlpha: `${palette.teal500}AA`,
    secondary: palette.teal500,

    mainBackground: LIGHT_BACKGROUND,
    stackHeaderBackground: LIGHT_BACKGROUND,
    tabBackground: LIGHT_BACKGROUND,
    tabActiveTint: palette.black,
    tabInactiveTint: palette.gray400,

    textPrimary: palette.gray900,
    textSecondary: palette.gray600,
    textTertiary: palette.gray400,
    textPrimaryInvert: palette.gray100,

    cardBackground: palette.white,
    cardInvert: palette.gray500,
    cardBackgroundLight: palette.neutral100,
    border: palette.neutral300,
    borderDeep: palette.neutral400,
    borderLight: palette.neutral100,

    white: palette.white,
    black: palette.black,

    success: palette.sky500,
    shadow: palette.gray300,

    priceUp: palette.sky500,
    priceDown: palette.rose500,

    modalBackground: palette.gray50,
    modalIndicator: palette.gray300,

    tag: palette.white,
    warning: palette.rose500,
    actionButton: palette.white,
};

export const lightTheme = {
    isDark: false,
    scheme: 'light',
    colors: COLORS_LIGHT,
    cardVariants: {
        simple: {
            backgroundColor: COLORS_LIGHT.cardBackground,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS_LIGHT.border,
            shadowColor: COLORS_LIGHT.shadow,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowRadius: 12,
            shadowOpacity: 0.5,
            elevation: 5,
        },
        tag: {
            backgroundColor: COLORS_LIGHT.cardBackground,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: rounded.m,
            borderColor: COLORS_LIGHT.border,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowColor: COLORS_LIGHT.shadow,
            shadowRadius: 5,
            shadowOpacity: 0.2,
            elevation: 3,
        },
        tagMute: {
            backgroundColor: LIGHT_BACKGROUND,
            borderWidth: 1,
            borderRadius: rounded.m,
            borderColor: COLORS_LIGHT.border,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowColor: COLORS_LIGHT.shadow,
            shadowRadius: 5,
            shadowOpacity: 0.2,
            elevation: 3,
        },
    },
    tag: {
        borderRadius: rounded.full,
        backgroundColor: COLORS_LIGHT.tag,
        borderWidth: 0.5,
        borderColor: COLORS_LIGHT.border,
        shadowColor: COLORS_LIGHT.shadow,
        shadowOffset: {
            height: 4,
            width: 0,
        },
        shadowRadius: 4,
        shadowOpacity: 0.2,
        elevation: 2,
    },
    buttonVariants: {
        primary: {
            backgroundColor: 'black',
        },
        secondary: {
            borderWidth: 1,
            backgroundColor: COLORS_LIGHT.mainBackground,
            borderColor: COLORS_LIGHT.borderDeep,
            faintBackColor: COLORS_LIGHT.border,
        },
        disabled: {
            backgroundColor: palette.neutral200,
        },
        danger: {
            backgroundColor: palette.rose500,
        },
    },
    buttonTextVariants: {
        primary: {
            color: palette.white,
        },
        secondary: {
            color: palette.neutral800,
        },
        disabled: {
            color: palette.neutral400,
        },
        danger: {
            color: palette.white,
        },
    },
    textVariants: {
        header: {
            fontSize: 32,
            color: COLORS_LIGHT.textPrimary,
            fontFamily: 'Font-700',
        },
        subheader: {
            fontSize: 18,
            color: COLORS_LIGHT.textPrimary,
            fontFamily: 'Font-500',
        },
        body: {
            fontSize: 15,
            color: palette.gray900,
            fontFamily: 'Font-400',
        },
        sub: {
            fontSize: 15,
            color: palette.gray700,
            fontFamily: 'Font-400',
        },
        small: {
            fontSize: 12,
            color: palette.gray500,
            fontFamily: 'Font-400',
        },
        tiny: {
            fontSize: 10,
            color: palette.gray500,
            fontFamily: 'Font-400',
        },
        nav: {
            color: palette.gray900,
            fontFamily: 'Font-500',
            fontSize: 16,
        },
    },
};

export type AppTheme = typeof lightTheme;

type AppColors = typeof COLORS_LIGHT;

const DARK_BACKGROUND = palette.dark900;

const COLORS_DARK: AppColors = {
    primary: palette.white,
    secondary: palette.teal400,
    secondaryAlpha: `${palette.teal400}AA`,

    mainBackground: DARK_BACKGROUND,
    stackHeaderBackground: DARK_BACKGROUND,
    tabBackground: DARK_BACKGROUND,
    tabActiveTint: palette.white,
    tabInactiveTint: palette.gray600,

    textPrimary: palette.gray100,
    textSecondary: palette.gray400,
    textTertiary: palette.gray600,
    textPrimaryInvert: palette.gray900,

    cardBackground: palette.dark800,
    cardBackgroundLight: palette.dark700,
    cardInvert: palette.dark300,

    border: '#384354',
    borderDeep: '#495465',
    borderLight: '#283344',

    white: palette.white,
    black: palette.black,

    success: palette.sky400,
    shadow: palette.black,

    priceUp: palette.sky300,
    priceDown: palette.rose400,

    modalBackground: palette.dark900,
    modalIndicator: palette.dark500,

    tag: palette.dark700,
    warning: palette.rose400,
    actionButton: palette.gray700,
};

export const darkTheme: AppTheme = {
    ...lightTheme,
    isDark: true,
    scheme: 'dark',
    colors: COLORS_DARK,
    cardVariants: {
        simple: {
            ...lightTheme.cardVariants.simple,
            backgroundColor: COLORS_DARK.cardBackground,
            borderColor: COLORS_DARK.border,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowColor: COLORS_DARK.shadow,
            shadowRadius: 5,
            shadowOpacity: 0.2,
            elevation: 3,
        },
        tag: {
            backgroundColor: COLORS_DARK.cardBackground,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS_DARK.border,
            borderRadius: rounded.m,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowColor: COLORS_DARK.shadow,
            shadowRadius: 5,
            shadowOpacity: 0.1,
            elevation: 3,
        },
        tagMute: {
            backgroundColor: COLORS_DARK.cardBackground,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: COLORS_DARK.border,
            borderRadius: rounded.m,
            shadowOffset: {
                height: 0,
                width: 6,
            },
            shadowColor: COLORS_DARK.shadow,
            shadowRadius: 5,
            shadowOpacity: 0.1,
            elevation: 3,
        },
    },
    tag: {
        borderRadius: rounded.full,
        backgroundColor: COLORS_DARK.tag,
        borderWidth: 0.5,
        borderColor: COLORS_DARK.border,
        shadowColor: COLORS_DARK.shadow,
        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowRadius: 0,
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonVariants: {
        primary: {
            backgroundColor: COLORS_DARK.white,
        },
        secondary: {
            backgroundColor: COLORS_DARK.mainBackground,
            borderColor: COLORS_DARK.primary,
            borderWidth: 1,
            faintBackColor: COLORS_DARK.borderLight,
        },
        disabled: {
            backgroundColor: palette.dark800,
        },
        danger: {
            backgroundColor: palette.rose400,
        },
    },
    buttonTextVariants: {
        primary: {
            color: palette.black,
        },
        secondary: {
            color: palette.white,
        },
        disabled: {
            color: palette.dark400,
        },
        danger: {
            color: palette.white,
        },
    },
    textVariants: {
        header: {
            ...lightTheme.textVariants.header,
            color: palette.gray50,
        },
        subheader: {
            ...lightTheme.textVariants.subheader,
            color: palette.gray100,
        },
        body: {
            ...lightTheme.textVariants.body,
            color: palette.gray100,
        },
        sub: {
            ...lightTheme.textVariants.sub,
            color: palette.gray300,
        },
        small: {
            ...lightTheme.textVariants.small,
            color: palette.gray300,
        },
        tiny: {
            ...lightTheme.textVariants.tiny,
            color: palette.gray300,
        },
        nav: {
            ...lightTheme.textVariants.nav,
            color: palette.gray100,
        },
    },
};
