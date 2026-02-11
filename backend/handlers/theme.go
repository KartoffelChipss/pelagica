package handlers

import (
	"log"
	"os"
	"pelagica-backend/services"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"

	"pelagica-backend/models"
)

func themesDir() string {
	dir := os.Getenv("THEMES_DIR")
	if dir == "" {
		dir = "themes"
	}
	return dir
}

var themeStore *services.ThemeStore

func InitThemeStore() {
	store, err := services.NewThemeStore(themesDir())
	if err != nil {
		panic(err)
	}
	themeStore = store
}

func GetThemes(c fiber.Ctx) error {
	return c.Status(fiber.StatusOK).JSON(themeStore.GetAll())
}

func GetTheme(c fiber.Ctx) error {
	id := c.Params("id", "")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Theme ID is required"})
	}

	theme, err := themeStore.Get(id)
	if err != nil {
		log.Println("Error retrieving theme:", err)
		return c.Status(fiber.StatusNotFound).JSON(models.APIError{Error: "Theme not found"})
	}

	return c.Status(fiber.StatusOK).JSON(theme)
}

func CreateTheme(c fiber.Ctx) error {
	var theme models.Theme

	if err := c.Bind().Body(&theme); err != nil {
		log.Println("Error decoding theme:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Failed to decode theme"})
	}

	if err := theme.Validate(); err != nil {
		log.Println("Theme validation error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid theme: " + err.Error()})
	}

	id, err := themeStore.Write(uuid.New().String(), theme)
	if err != nil {
		log.Println("Error writing theme:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save theme"})
	}

	log.Printf("Theme created: %s (ID: %s)", theme.Name, id)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"id": id})
}

func UpdateTheme(c fiber.Ctx) error {
	id := c.Params("id", "")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Theme ID is required"})
	}

	var theme models.Theme

	if err := c.Bind().Body(&theme); err != nil {
		log.Println("Error decoding theme:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Failed to decode theme"})
	}

	if err := theme.Validate(); err != nil {
		log.Println("Theme validation error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid theme: " + err.Error()})
	}

	_, err := themeStore.Write(id, theme)
	if err != nil {
		log.Println("Error updating theme:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to update theme"})
	}

	log.Printf("Theme updated: ID %s", id)

	return c.SendStatus(fiber.StatusNoContent)
}

func DeleteTheme(c fiber.Ctx) error {
	id := c.Params("id", "")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Theme ID is required"})
	}

	err := themeStore.Delete(id)
	if err != nil {
		log.Println("Error deleting theme:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to delete theme"})
	}

	log.Printf("Theme deleted: ID %s", id)

	return c.SendStatus(fiber.StatusNoContent)
}
