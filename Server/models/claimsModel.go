package models

import (
	"github.com/golang-jwt/jwt/v4"
)

type JwtCustomClaims struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	ID       uint   `json:"id"`

	jwt.RegisteredClaims
}
