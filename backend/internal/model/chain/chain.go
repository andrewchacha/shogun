package chain

type Chain string

const (
	Solana Chain = "solana"
	Sui    Chain = "sui"
)

var Supported = []Chain{Solana, Sui}

func (c Chain) IsSupported() bool {
	for _, s := range Supported {
		if c == s {
			return true
		}
	}
	return false
}
