package utils

import (
	"os"
	"time"

	"mini-drive/models"

	"github.com/golang-jwt/jwt/v4"
)

var jwtSecretKey = []byte(os.Getenv("SECRET"))

func GenerateToken(user models.User) (string, error) {
	// initialize claims
	// initialize claims
	claims := &models.JwtCustomClaims{
		Username: user.Username,
		Email:    user.Email,
		ID:       user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 7)),
			Issuer:    "minidrive.app",
		},
	}

	// create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// sign token
	return token.SignedString(jwtSecretKey)
}
