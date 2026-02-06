package initializers

import(
	"fmt"
	"log"

	"mini-drive/models"
)

func SyncDB() {
	
	err := DB.AutoMigrate(&models.User{}, &models.File{})
	if err != nil {
		log.Fatal("failed to auto migrate: ", err)
	}

	fmt.Println("Database synchronized successfully")
}
