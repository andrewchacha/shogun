import crypto from 'react-native-quick-crypto';

// Utility function to derive keys for encryption and HMAC from a single password
function deriveKeys(password: string, salt: ArrayBuffer) {
    const keyLength = 32; // 32 bytes for AES-256
    const iterations = 100000;

    // Derive a longer key, then split it for both uses
    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keyLength * 2, 'SHA-256');
    const encryptionKey = derivedKey.slice(0, keyLength);
    const hmacKey = derivedKey.slice(keyLength);

    return {encryptionKey, hmacKey};
}

// Encrypts the data and returns encrypted data with HMAC, IV, and salt
function encryptText(data: string, password: string) {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16);
    const {encryptionKey, hmacKey} = deriveKeys(password, salt);

    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const hmac = crypto.createHmac('sha256', hmacKey);
    hmac.update(encrypted);

    const hmacDigest = hmac.digest('hex');

    const ivHex = Buffer.from(iv).toString('hex');
    const saltHex = Buffer.from(salt).toString('hex');

    return `${encrypted}:${ivHex}:${saltHex}:${hmacDigest}`;
}

// Decrypts the data if HMAC is verified
function decryptText(data: string, password: string) {
    const split = data.split(':');
    if (split.length !== 4) {
        throw new Error('Invalid encrypted data format');
    }
    const [encrypted, ivHex, saltHex, hmacHex] = split;

    const iv = Buffer.from(ivHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');

    const {encryptionKey, hmacKey} = deriveKeys(password, salt);

    const hmac = crypto.createHmac('sha256', hmacKey);
    hmac.update(encrypted);
    const verifyHmacDigest = hmac.digest('hex');

    if (verifyHmacDigest !== hmacHex) {
        throw new Error('Data integrity check failed');
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted as string;
}

export default {
    encryptText,
    decryptText,
};
