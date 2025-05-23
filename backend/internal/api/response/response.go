package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
)

type Status int

const (
	StatusOK           Status = 200
	StatusBadRequest   Status = 400
	StatusUnauthorized Status = 401

	StatusServerError Status = 500

	ErrorAccessTokenExpired         Status = 4000
	ErrorUserNotFound               Status = 4001
	ErrorUpdateUsernameBlocked      Status = 4002
	ErrorUpdateNameBlocked          Status = 4003
	ErrorChainNotSupportedForAction Status = 4004
)

type Response struct {
	Status Status `json:"status"`
	Data   any    `json:"data,omitempty"`
	Error  string `json:"error,omitempty"`
}

func JSON(e echo.Context, data any) error {
	r := &Response{Status: StatusOK, Data: data}
	return e.JSON(http.StatusOK, r)
}

func OtherErrors(e echo.Context, code Status, msg string) error {
	r := &Response{Status: code, Error: msg}
	log.Warn().Str("api", e.Path()).Int("code", int(code)).Msg(msg)
	return e.JSON(http.StatusOK, r)
}

func UnauthorizedError(e echo.Context) error {
	return OtherErrors(e, StatusUnauthorized, "")
}

func BadRequestError(e echo.Context, msg string) error {
	r := &Response{Status: StatusBadRequest, Error: msg}
	log.Warn().Str("api", e.Request().RequestURI).Int("code", int(StatusBadRequest)).Msg(msg)
	return e.JSON(http.StatusOK, r)
}

func ServerError(e echo.Context, err error, msg string) error {
	r := &Response{Status: StatusServerError, Error: msg}
	log.Warn().Str("api", e.Request().RequestURI).Int("code", int(StatusServerError)).Err(err).Msg(msg)
	return e.JSON(http.StatusOK, r)
}

func Success(e echo.Context) error {
	r := &Response{Status: StatusOK, Data: map[string]interface{}{"success": true}}
	return e.JSON(http.StatusOK, r)
}
