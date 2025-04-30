package ids

import (
	"encoding/hex"
	"strings"

	"github.com/oklog/ulid/v2"
)

// UlidFromHex converts a hex string to an ULID id
func UlidFromHex(str string) ulid.ULID {
	if strings.HasPrefix(str, "0x") {
		str = str[2:]
	}
	hh, err := hex.DecodeString(str)
	if err != nil {
		panic(err)
	}
	uss := ulid.ULID{}
	err = uss.UnmarshalBinary(hh)
	if err != nil {
		panic(err)
	}
	return uss
}
