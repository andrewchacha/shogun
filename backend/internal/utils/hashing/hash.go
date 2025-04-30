package hashing

import "crypto/sha256"

func Sha256(str string) []byte {
	hash := sha256.New()
	_, err := hash.Write([]byte(str))
	if err != nil {
		panic(err)
	}
	hashedMessage := hash.Sum(nil)
	return hashedMessage
}
