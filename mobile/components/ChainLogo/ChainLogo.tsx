import {Image, ImageProps} from 'expo-image';
import {Chain} from '@/chains/chain';

const suiLogo = require('@/assets/images/sui-logo.png');
const solanaLogo = require('@/assets/images/solana-logo.png');

interface Props extends ImageProps {
    chain: Chain;
}

export const ChainLogo = (props: Props) => {
    const source = props.chain === Chain.Solana ? solanaLogo : props.chain === Chain.Sui ? suiLogo : null;
    if (!source) return null;
    return <Image source={source} style={[{width: 24, height: 24}, props.style]} {...props} />;
};
