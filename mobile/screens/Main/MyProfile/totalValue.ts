import {atom} from 'jotai';
import BigNumber from 'bignumber.js';

type Totals = {
    [key: string]: string;
};
export const totalsAtom = atom<Totals>({});
export const totalSumAtom = atom(get => {
    const totals = get(totalsAtom);
    return Object.values(totals).reduce((sum, total) => sum.plus(total), new BigNumber(0));
});
