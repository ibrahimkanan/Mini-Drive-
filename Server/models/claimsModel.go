package models

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type JwtCustomClaims struct {
	Username string    `json:"username"`
	Email    string    `json:"email"`
	ID       uint      `json:"id"`
	Expiry   time.Time `json:"expiry"`
	jwt.RegisteredClaims
}
