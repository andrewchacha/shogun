import {SolanaChain} from '@/chains/solana/solana';
import {Chain} from '@/chains/chain';
import {SuiChain} from '@/chains/sui/sui';
import {ChainInterface} from '@/chains/chainInterface';

export const ChainOperations: {[key in Chain]: ChainInterface} = {
    solana: SolanaChain.getInstance(),
    sui: SuiChain.getInstance(),
};

export function getChainOperations(chain: Chain): ChainInterface {
    return ChainOperations[chain];
}
