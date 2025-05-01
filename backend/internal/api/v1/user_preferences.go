package v1

import (
	"shogun/internal/api/middleware/auth"
	"shogun/internal/api/response"
	"shogun/internal/model/preferences"

	"github.com/labstack/echo/v4"
)

func (uc *UserController) GetPreferences(e echo.Context) error {
	userID := auth.MustGetUserID(e)

	p := &preferences.Preferences{}
	if err := e.Bind(p); err != nil {
		return response.BadRequestError(e, "")
	}
	pre, err := uc.preferenceService.Get(userID)
	if err != nil {
		return response.ServerError(e, err, "")
	}
	return response.JSON(e, pre)
}

func (uc *UserController) UpdatePreferences(e echo.Context) error {
	userID := auth.MustGetUserID(e)

	updatable := &preferences.Preferences{}
	if err := e.Bind(updatable); err != nil {
		return response.BadRequestError(e, "")
	}
	err := uc.preferenceService.Update(userID, updatable)
	if err != nil {
		return response.ServerError(e, err, "")
	}
	return response.Success(e)
}
