export const validateMnemonic = (mnemonic: string): boolean => {
    const split = mnemonic.trim().split(' ');
    return split.length % 3 === 0 && split.length >= 12;
};
