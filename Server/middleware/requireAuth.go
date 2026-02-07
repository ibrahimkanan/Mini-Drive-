package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"mini-drive/initializers"
	"mini-drive/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// requireAuth middleware : checks if the user is authenticated using JWT

func RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// 1. Get the cookie
		cookie, err := c.Cookie("Authorization")
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Login required")
		}

		// 2. Parse & Validate Token
		tokenString := cookie.Value
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Check the signing method : HMAC
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("SECRET")), nil
		})

		// 3. Check specific JWT errors
		if err != nil || !token.Valid {
			return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token")
		}

		// 4. Extract Claims & User
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			// Check Expiration
			if exp, ok := claims["exp"].(float64); ok {
				if float64(time.Now().Unix()) > exp {
					return echo.NewHTTPError(http.StatusUnauthorized, "Token expired")
				}
			} else {
				// Handle case where exp is missing or not a float64
				return echo.NewHTTPError(http.StatusUnauthorized, "Invalid token claims: missing expiration")
			}

			// Find User
			var user models.User
			// Find the user by id
			initializers.DB.First(&user, claims["id"])

			if user.ID == 0 {
				return echo.NewHTTPError(http.StatusUnauthorized, "User not found")
			}

			// 5. Attach to Context
			c.Set("user", &user)
			return next(c)
		}

		return echo.NewHTTPError(http.StatusUnauthorized, "Invalid claims")
	}
}
