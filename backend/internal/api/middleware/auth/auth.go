package auth

import (
	"errors"
	"shogun/internal/api/response"
	"shogun/internal/security/accesstoken"

	"github.com/labstack/echo/v4"
)

func Auth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(e echo.Context) error {
		t := e.Request().Header.Get("Access-Token")
		if t == "" {
			return response.UnauthorizedError(e)
		}
		userId, err := accesstoken.Validate(t)
		if err != nil {
			if errors.Is(err, accesstoken.ErrorTokenExpired) {
				return response.OtherErrors(e, response.ErrorAccessTokenExpired, "access token expired")
			}
			return response.UnauthorizedError(e)
		}
		e.Set("access-token-userid", userId)
		return next(e)
	}
}

func MustGetUserID(e echo.Context) int64 {
	userId := e.Get("access-token-userid")
	if userId != nil {
		return userId.(int64)
	}
	panic("user id not found in context")
	return 0
}
