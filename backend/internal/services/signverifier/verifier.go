package signverifier

import (
	"shogun/internal/model/chain"
	"strings"

	"github.com/gagliardetto/solana-go"
	"github.com/mr-tron/base58"
)

func Verify(c chain.Chain, message, address string, signature string) bool {
	switch c {
	case chain.Solana:
		return verifySolana(message, address, signature)
	case chain.Sui:
		return verifySui(message, address, signature)
	default:
		return false
	}
}

func verifySolana(message, address string, signature string) bool {
	pk, err := solana.PublicKeyFromBase58(address)
	if err != nil {
		return false
	}
	sig, err := solana.SignatureFromBase58(signature)
	if err != nil {
		return false
	}
	return pk.Verify([]byte(message), sig)
}

func verifySui(message, address string, signSplit string) bool {
	split := strings.Split(signSplit, ":")
	if len(split) != 2 {
		return false
	}
	publicKey, err := base58.Decode(split[0])
	if err != nil {
		return false
	}
	signerAddress := SuiED25519KeyToAddress(publicKey)
	if signerAddress != address {
		return false
	}
	//we use solana since it's all just ED25519 key
	//they are the same
	return verifySolana(message, split[0], split[1])
}
