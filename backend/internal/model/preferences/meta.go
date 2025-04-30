package preferences

import (
	"database/sql/driver"
	"encoding/json"
)

type Preferences struct {
	OnlineStatus    *bool `json:"show_online_status,omitempty"`
	ReadReceipts    *bool `json:"read_receipts,omitempty"`
	TypingIndicator *bool `json:"typing_indicator,omitempty"`
	LastSeen        *bool `json:"last_seen,omitempty"`
	SearchUsername  *bool `json:"search_username,omitempty"`
	SearchAddress   *bool `json:"search_address,omitempty"`
}

func (m *Preferences) Scan(src interface{}) error {
	jsonBytes, ok := src.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(jsonBytes, m)
}

func (m Preferences) Value() (driver.Value, error) {
	jsonBytes, err := json.Marshal(m)
	if err != nil {
		return nil, err
	}
	return jsonBytes, nil
}

func DefaultPreferences() Preferences {
	d := true
	return Preferences{
		OnlineStatus:    &d,
		ReadReceipts:    &d,
		TypingIndicator: &d,
		SearchUsername:  &d,
		SearchAddress:   &d,
		LastSeen:        &d,
	}
}
