package models

import "gorm.io/gorm"

type User struct {
	gorm.Model

	Username string `json:"username"`

	Email string `json:"email"`

	Password string `json:"password"`

	Files []File `json:"files"` // files uploaded by the user
}
