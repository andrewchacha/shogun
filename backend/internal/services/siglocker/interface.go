package siglocker

type UseChecker interface {
	IsSignatureUsed(signature string) bool
	Notify(signature string) error
}
