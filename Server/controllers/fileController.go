package controllers

import (
	"fmt"
	"io"
	"mini-drive/initializers"
	"mini-drive/models"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func UploadFile(c echo.Context) error {
	// get the user form the middlewhere
	user := c.Get("user").(*models.User)

	// read the file form request
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "No file uploaded",
		})
	}

	// size validation
	if fileHeader.Size > 5*1024*1024 {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "File size is too large",
		})
	}

	// content type validation
	ext := filepath.Ext(fileHeader.Filename)
	if ext != ".jpg" && ext != ".png" && ext != ".pdf" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "Invalid file type",
		})
	}

	// open the file for reading
	src, err := fileHeader.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to open file",
		})
	}
	defer src.Close()

	// generate UUID for the file
	fileUUID := uuid.New().String()
	newFileName := fileUUID + ext
	storagePath := filepath.Join("uploads", newFileName)

	// Ensure uploads directory exists
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to create uploads directory",
		})
	}

	// create and empty file for the uploads
	dst, err := os.Create(storagePath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Could not save the file",
		})
	}
	defer dst.Close()

	// copy content
	if _, err := io.Copy(dst, src); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to save file",
		})
	}

	// create file record in DB
	fileRecord := models.File{
		OriginalName: fileHeader.Filename,
		StorageName:  newFileName,
		ContentType:  fileHeader.Header.Get("Content-Type"),
		Size:         fileHeader.Size,
		UserID:       user.ID,
		GenerateUUID: fileUUID,
	}

	if err := initializers.DB.Create(&fileRecord).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to save file record in DB",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "File uploaded successfully",
		"file":    fileRecord,
	})
}

func ListFiles(c echo.Context) error {
	user := c.Get("user").(*models.User)
	var files []models.File

	if err := initializers.DB.Where("user_id = ?", user.ID).Find(&files).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to fetch files",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"files": files,
	})
}

func DownloadFile(c echo.Context) error {
	user := c.Get("user").(*models.User)
	fileID := c.Param("id")

	// search for the file in the DB
	var file models.File
	result := initializers.DB.Where("id = ? AND user_id = ?", fileID, user.ID).First(&file)
	if result.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File record not found in DB. ID: %s, UserID: %d, Error: %v", fileID, user.ID, result.Error),
		})
	}

	// Determine the real path
	filePath := filepath.Join("uploads", file.StorageName)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File not found on disk at path: %s", filePath),
		})
	}

	// Send the file with the original name
	// c.Attachment will force the browser to download the file
	return c.Attachment(filePath, file.OriginalName)
}

func DeleteFile(c echo.Context) error {
	user := c.Get("user").(*models.User)
	fileID := c.Param("id")

	// search for the file in the DB
	var file models.File
	result := initializers.DB.Where("id = ? AND user_id = ?", fileID, user.ID).First(&file)
	if result.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File record not found in DB for delete. ID: %s, UserID: %d", fileID, user.ID),
		})
	}

	// Determine the real path
	filePath := filepath.Join("uploads", file.StorageName)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File to delete not found on disk at path: %s", filePath),
		})
	}

	// Delete the file
	if err := os.Remove(filePath); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to delete file",
		})
	}

	// Delete the file record from DB
	if err := initializers.DB.Delete(&file).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to delete file record from DB",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "File deleted successfully",
	})
}

func GetFileMetadata(c echo.Context) error {
	user := c.Get("user").(*models.User)
	fileID := c.Param("id")

	// search for the file in the DB
	var file models.File
	result := initializers.DB.Where("id = ? AND user_id = ?", fileID, user.ID).First(&file)
	if result.Error != nil {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File metadata not found in DB. ID: %s, UserID: %d", fileID, user.ID),
		})
	}

	// Determine the real path
	filePath := filepath.Join("uploads", file.StorageName)

	// Check if file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return c.JSON(http.StatusNotFound, echo.Map{
			"error": fmt.Sprintf("File for metadata not found on disk at path: %s", filePath),
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"id":           file.ID,
		"name":         file.OriginalName,
		"size":         file.Size,
		"type":         file.ContentType,
		"created_at":   file.CreatedAt,
		"download_url": "/files/" + strconv.Itoa(int(file.ID)),
	})
}
