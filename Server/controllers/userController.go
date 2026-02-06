package controllers

import (
	"net/http"
	"time"

	"mini-drive/initializers"
	"mini-drive/models"
	"mini-drive/utils"

	"github.com/labstack/echo/v4"
)

// Signup
func Signup(c echo.Context) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "Invalid request body",
		})
	}

	// hash password
	hashedPassword, err := utils.HashPassword(body.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "Failed to hash password",
		})
	}

	// create user
	user := models.User{
		Email:    body.Email,
		Password: hashedPassword,
	}

	// check if email already exists
	var existingUser models.User
	if err := initializers.DB.Where("email = ?", body.Email).First(&existingUser).Error; err == nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "Email already exists",
		})
	}

	// create user
	if err := initializers.DB.Create(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "Failed to create user",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "User created successfully",
	})
}

// Login
func Login(c echo.Context) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// bind body
	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid request body",
		})
	}

	// check for Email
	var user models.User
	if err := initializers.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "Invalid email or password",
		})
	}

	// check for password
	if err := utils.CheckPassword(body.Password, user.Password); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "Invalid email or password",
		})
	}

	// generate token
	token, err := utils.GenerateToken(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "Failed to generate token",
		})
	}

	// set cookie
	c.SetCookie(&http.Cookie{
		Name:     "Authorization",
		Value:    token,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(time.Hour * 24 * 30),
	})

	return c.JSON(http.StatusOK, echo.Map{
		"message": "User logged in successfully",
	})
}
func Logout(c echo.Context) error {
	// clear cookie
	c.SetCookie(&http.Cookie{
		Name:     "Authorization",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(-time.Hour),
	})

	return c.JSON(http.StatusOK, echo.Map{
		"message": "User logged out successfully",
	})
}

// Validate
func Validate(c echo.Context) error {
	// Get the user from the context
	user, _ := c.Get("user").(models.User)
	return c.JSON(http.StatusOK, echo.Map{
		"message": "You are logged in",
		"user":    user,
	})
}
