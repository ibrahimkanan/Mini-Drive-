package models

import "gorm.io/gorm"

type File struct {
	gorm.Model

	OriginalName string `json:"original_name" ` // original name of the file

	StorageName string `json:"storage_name" ` // name of the file in the storage

	ContentType string `json:"content_type" ` // content type of the file

	Size int64 `json:"size" ` // size of the file

	UserID uint `json:"user_id"` // user id of the file

	GenerateUUID string `json:"generate_uuid" ` // generate uuid of the file
}
