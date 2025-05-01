package accesstoken

import (
	"errors"
	"fmt"
	"shogun/config"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/rs/zerolog/log"
)

var ErrorInvalidUser = errors.New("invalid user")
var ErrorTokenExpired = errors.New("token expired")
var ErrorTokenUsedBeforeTime = errors.New("token used before time")

const (
	tokenDuration = 30000 * time.Minute
)

func GenerateTokenForUser(id int64) (string, int64) {
	signingKey := []byte(config.Cfg.AccessTokenSecret)

	nowTime := time.Now().Unix()
	expireAt := time.Now().Add(tokenDuration).Unix()
	claims := jwt.MapClaims{
		"aud": fmt.Sprintf("%d", id),
		"iat": nowTime,
		"nbf": nowTime,
		"exp": expireAt,
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString(signingKey)
	if err != nil {
		log.Fatal().Err(err).Send()
	}
	return tokenStr, expireAt
}

func Validate(accessToken string) (int64, error) {
	parser := new(jwt.Parser)
	parser.UseJSONNumber = true
	token, err := jwt.Parse(accessToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(config.Cfg.AccessTokenSecret), nil
	})
	if err != nil {
		if strings.Contains(err.Error(), "expired") {
			return 0, ErrorTokenExpired
		}
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		userID, err := strconv.ParseInt(claims["aud"].(string), 10, 64)
		if err != nil {
			return 0, err
		}
		return userID, nil
	}
	return 0, err
}
