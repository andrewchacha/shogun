//Chain - all chains that are supported by the app
export const Chain = {
    Solana: 'solana',
    Sui: 'sui',
} as const;

export type Chain = (typeof Chain)[keyof typeof Chain];
export const AllChains = Object.values(Chain);

export const ChainColors = {
    [Chain.Solana]: '#D724FD',
    [Chain.Sui]: '#4DA2FF',
};
