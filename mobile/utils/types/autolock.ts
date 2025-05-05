export const Autolock = {
    Immediately: 1,
    '30s': 30,
    '1min': 60,
    '5min': 300,
    Never: -1,
} as const;

export type Autolock = typeof Autolock[keyof typeof Autolock];
