package signverifier

import (
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/blake2b"
)

type SigFlag byte

const (
	SigFlagEd25519   SigFlag = 0x00
	SigFlagSecp256k1 SigFlag = 0x01
)

func SuiED25519KeyToAddress(pubKey []byte) string {
	newPubkey := []byte{byte(SigFlagEd25519)}
	newPubkey = append(newPubkey, pubKey...)

	addrBytes := blake2b.Sum256(newPubkey)
	return fmt.Sprintf("0x%s", hex.EncodeToString(addrBytes[:])[:64])
}
