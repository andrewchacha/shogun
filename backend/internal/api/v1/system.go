package v1

import (
	"shogun/config"
	"shogun/internal/api/response"
	"time"

	"github.com/labstack/echo/v4"
)

type systemData struct {
	Version      string `json:"version"`
	UsernameLock int    `json:"username_lock"`
	NameLock     int    `json:"name_lock"`
	Timestamp    int64  `json:"timestamp"`
	BioMaxLength int    `json:"bio_max_length"`
	UsernameMax  int    `json:"username_max_length"`
	UsernameMin  int    `json:"username_min_length"`
	NameMax      int    `json:"name_max_length"`
}

type SystemController struct {
	data systemData
}

func NewSystemController() *SystemController {
	return &SystemController{
		data: systemData{
			Version:      "1",
			UsernameLock: config.Cfg.UsernameUpdateLockDays,
			NameLock:     config.Cfg.NameUpdateLockDays,
			BioMaxLength: config.Cfg.BioMaxLength,
			UsernameMax:  config.Cfg.UsernameMaxLength,
			UsernameMin:  config.Cfg.UsernameMinLengthNormal,
			NameMax:      config.Cfg.NameMaxLength,
		},
	}
}

func (sc SystemController) SystemGET(e echo.Context) error {
	sc.data.Timestamp = time.Now().UnixMilli()
	return response.JSON(e, sc.data)
}
