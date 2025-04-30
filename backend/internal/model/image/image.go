package image

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

type Image struct {
	Uri      string `json:"uri"`
	BlurHash string `json:"blurhash,omitempty"` //blur hash
}

func (img *Image) Scan(value interface{}) error {
	if value == nil {
		*img = Image{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, img)
}

func (img Image) Value() (driver.Value, error) {
	return json.Marshal(img)
}
