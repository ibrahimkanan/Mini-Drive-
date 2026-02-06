package controllers

import (
	"net/http"
	"os"
	"io"

	"github.com/labstack/echo/v4"
)

func UploadFile(c echo.Context) error {
	// read from field name
	name := c.FormValue("name")

	// source
	file, err := c.FormFile("file")
	if err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()


	// destination
	dest, err := os.Create(file.Filename)
	if err != nil {
		return err
	}
	defer dest.Close()

	_, err = io.Copy(dest, src)
	if err != nil {
		return err
	}
	return c.String(http.StatusOK, "Upload File" + name)
}

func ListFiles(c echo.Context) error {
	return c.String(http.StatusOK, "List Files")
}

func DownloadFile(c echo.Context) error {
	return c.String(http.StatusOK, "Download File")
}

func DeleteFile(c echo.Context) error {
	return c.String(http.StatusOK, "Delete File")
}

func GetFile(c echo.Context) error {
	return c.String(http.StatusOK, "Get File")
}

func ValidateFile(c echo.Context) error {
	return c.String(http.StatusOK, "Validate File")
}