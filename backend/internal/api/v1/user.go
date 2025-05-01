package v1

import (
	"errors"
	"fmt"
	"io"
	"shogun/config"
	"shogun/internal/api/middleware/auth"
	"shogun/internal/api/response"
	"shogun/internal/model/account"
	"shogun/internal/model/image"
	"shogun/internal/model/user"
	"shogun/internal/services/accountstore"
	"shogun/internal/services/fileuploader"
	"shogun/internal/services/prefstore"
	"shogun/internal/services/usercache"
	"shogun/internal/services/userstore"
	"shogun/internal/utils/blurhash"
	"time"

	"github.com/gabriel-vasile/mimetype"
	"github.com/labstack/echo/v4"
	"github.com/lithammer/shortuuid/v4"
	"github.com/rs/zerolog/log"
)

type UserController struct {
	userService       userstore.Store
	accountService    accountstore.Store
	r2UploaderService fileuploader.Service
	preferenceService prefstore.Store
	userCache         usercache.SimpleCache
}

func NewUserController(
	us userstore.Store,
	as accountstore.Store,
	rs fileuploader.Service,
	ps prefstore.Store,
	uc usercache.SimpleCache,
) *UserController {

	return &UserController{
		userService:       us,
		accountService:    as,
		r2UploaderService: rs,
		preferenceService: ps,
		userCache:         uc,
	}
}

// @Enum meResponse
type meResponse struct {
	user.User
	Accounts []account.Simple `json:"accounts"`
}

// @Title Get my profile
// @Description Get my profile
// @Success 200 {object} meResponse
// @Route /user/me [get]
func (uc *UserController) GetMe(e echo.Context) error {
	userID := auth.MustGetUserID(e)
	u, err := uc.userService.GetOne(userID)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	accounts, err := uc.accountService.GetSimpleByUserID(userID)
	if err != nil {
		return response.ServerError(e, err, "")
	}
	res := meResponse{
		User:     *u,
		Accounts: accounts,
	}

	return response.JSON(e, res)
}

// TODO check username make sure we can go back to previous used one
// TODO locked previous used one for a few days so that no one else can use them
func (uc *UserController) Update(e echo.Context) error {
	userID := auth.MustGetUserID(e)

	updatable := &user.Updatable{}
	if err := e.Bind(updatable); err != nil {
		return response.BadRequestError(e, err.Error())
	}

	//block updating username and name temporarily
	if updatable.Username != nil || updatable.Name != nil {
		u, err := uc.userService.GetMeta(userID)
		if err != nil {
			return response.ServerError(e, err, "")
		}
		if updatable.Username != nil && time.Since(time.UnixMilli(u.LastUsernameUpdate)).Hours() < float64(24*config.Cfg.UsernameUpdateLockDays) {
			return response.OtherErrors(e, response.ErrorUpdateUsernameBlocked, "username can't be updated yet")
		}
		if updatable.Name != nil && time.Since(time.UnixMilli(u.LastNameUpdate)).Hours() < float64(24*config.Cfg.NameUpdateLockDays) {
			return response.OtherErrors(e, response.ErrorUpdateNameBlocked, "name can't be updated yet")
		}
	}
	if updatable.Bio != nil && !user.IsBioValid(*updatable.Bio) {
		return response.BadRequestError(e, "bio is too long")
	}
	if updatable.Username != nil && !user.IsUsernameValid(*updatable.Username) {
		return response.BadRequestError(e, "username is invalid")
	}
	if updatable.Name != nil && !user.IsNameValid(*updatable.Name) {
		return response.BadRequestError(e, "name is invalid")
	}

	err := uc.userService.Update(userID, updatable)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	return response.Success(e)
}

func (uc *UserController) UpdateThumbnail(e echo.Context) error {
	userID := auth.MustGetUserID(e)

	contentLength := e.Request().ContentLength
	if contentLength > 1*1024*1024 {
		return response.BadRequestError(e, "max length 1MB")
	}
	buffer := make([]byte, 1024)
	bodyReader := io.LimitReader(e.Request().Body, 1*1024*1024)

	n, err := io.ReadFull(bodyReader, buffer)
	if err != nil && err != io.EOF && !errors.Is(err, io.ErrUnexpectedEOF) {
		return response.ServerError(e, err, "error reading file")
	}
	mime := mimetype.Detect(buffer[:n])
	contentType := mime.String()
	ext := mime.Extension()

	pr, pw := io.Pipe()
	go func() {
		defer pw.Close()
		if _, err := pw.Write(buffer[:n]); err != nil {
			log.Err(err).Send()
			return
		}
		if _, err = io.Copy(pw, bodyReader); err != nil {
			log.Err(err).Send()
			return
		}
	}()

	fileName := fmt.Sprintf("thu%d%s%s", userID, shortuuid.New(), ext)
	data := &fileuploader.Data{}
	data.Body = pr
	data.FileName = fileName
	data.ContentType = contentType
	location, err := uc.r2UploaderService.Upload(data)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	imageMeta := &image.Image{}
	imageMeta.Uri = location
	err = uc.userService.UpdateThumbnail(userID, imageMeta)
	if err != nil {
		return response.ServerError(e, err, "")
	}

	go func() {
		hash, err := blurhash.GetFromUrl(imageMeta.Uri + "?w=50&h=50&o=png")
		if err != nil {
			return
		}
		err = uc.userService.UpdateThumbnail(userID, &image.Image{
			BlurHash: hash,
			Uri:      imageMeta.Uri,
		})
		if err != nil {
			log.Error().Err(err).Msg("failed to update thumbnail")
		}
	}()

	return response.JSON(e, imageMeta)
}
