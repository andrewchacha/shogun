export const DISPLAY_THEMES = ['system', 'light', 'dark'] as const;
export type DisplayTheme = (typeof DISPLAY_THEMES)[number];
