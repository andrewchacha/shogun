package fileuploader

type Service interface {
	Upload(params *Data) (string, error)
}
