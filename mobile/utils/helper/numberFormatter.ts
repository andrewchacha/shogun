import BigNumber from 'bignumber.js';

type FormatAmountOptions = {
    price?: string | number | BigNumber;
    priceCurrency?: string;
    decimals?: number;
};

export function formatAmount(
    amount: number | string | BigNumber | undefined,
    options: FormatAmountOptions = {},
): string {
    if (!amount) return '0';
    const number = new BigNumber(amount);
    if (number.isNaN()) return '0';
    let precision = number.decimalPlaces() || 0;
    if (number.abs().gte(100)) {
        return number.toFormat(2);
    }
    if (options.decimals) {
        return number.toFormat(options.decimals);
    }
    if (options.price) {
        const price = new BigNumber(options.price);
        if (price.gt(0)) {
            precision = Math.floor(Math.log10(price.toNumber()));
        }
    }

    if (number.abs().gte(1) && precision > 4) precision = 4;
    if (precision < 2) precision = 2;
    if (precision > 8) precision = 8;

    if (number.abs().lt(1)) {
        return number.toPrecision(precision, BigNumber.ROUND_DOWN);
    }
    return number.toFormat(precision, BigNumber.ROUND_DOWN);
}

export function formatComma(amount: number | string | BigNumber | undefined): string {
    if (!amount) return '0';
    const number = new BigNumber(amount);
    if (number.isNaN()) return '0';
    return number.toFormat(number.decimalPlaces() || 0);
}
