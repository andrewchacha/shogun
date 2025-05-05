import {bech32} from 'bech32';

//decodeSuiPrivateKey - decodes the saves sui private key, which is a bech32 encoded string
//doing it here coz the function on Sui library throws error on import
export function decodeSuiPrivateKey(value: string): ParsedKeypair {
    const {prefix, words} = bech32.decode(value);
    if (prefix !== SUI_PRIVATE_KEY_PREFIX) {
        throw new Error('invalid private key prefix');
    }
    const extendedSecretKey = new Uint8Array(bech32.fromWords(words));
    const secretKey = extendedSecretKey.slice(1);
    const signatureScheme = SIGNATURE_FLAG_TO_SCHEME[extendedSecretKey[0] as keyof typeof SIGNATURE_FLAG_TO_SCHEME];
    return {
        schema: signatureScheme,
        secretKey: secretKey,
    };
}

const SUI_PRIVATE_KEY_PREFIX = 'suiprivkey';
const SIGNATURE_SCHEME_TO_FLAG = {
    ED25519: 0x00,
    Secp256k1: 0x01,
    Secp256r1: 0x02,
    MultiSig: 0x03,
    ZkLogin: 0x05,
} as const;

const SIGNATURE_SCHEME_TO_SIZE = {
    ED25519: 32,
    Secp256k1: 33,
    Secp256r1: 33,
};

const SIGNATURE_FLAG_TO_SCHEME = {
    0x00: 'ED25519',
    0x01: 'Secp256k1',
    0x02: 'Secp256r1',
    0x03: 'MultiSig',
    0x05: 'ZkLogin',
} as const;
type SignatureScheme = 'ED25519' | 'Secp256k1' | 'Secp256r1' | 'MultiSig' | 'ZkLogin';
type SignatureFlag = keyof typeof SIGNATURE_FLAG_TO_SCHEME;

export type ParsedKeypair = {
    schema: SignatureScheme;
    secretKey: Uint8Array;
};
