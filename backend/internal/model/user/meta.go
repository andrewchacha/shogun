package user

import (
	"database/sql/driver"
	"encoding/json"
)

type Meta struct {
	LastNameUpdate     int64 `json:"last_name_update,omitempty"`     //used to limit thumbnail updates
	LastUsernameUpdate int64 `json:"last_username_update,omitempty"` //used to limit username updates
}

// Scan - interface for scanning from postgres jsonBytes into our struct
func (m *Meta) Scan(src interface{}) error {
	jsonBytes, ok := src.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(jsonBytes, m)
}

// Value - interface for marshalling out struct into jsonBytes for postgresql
func (m Meta) Value() (driver.Value, error) {
	jsonBytes, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	return jsonBytes, nil
}
