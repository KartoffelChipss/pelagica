package handlers

import (
	"encoding/json"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"pelagica-backend/models"
)

func themePath() string {
	path := os.Getenv("THEME_PATH")
	if path == "" {
		path = "theme.json"
	}
	return path
}

func defaultThemePath() string {
	path := os.Getenv("DEFAULT_THEME_PATH")
	if path == "" {
		path = "default.default.theme.json"
	}
	return path
}

func GetTheme(c fiber.Ctx) error {
	path := themePath()

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			defaultPath := defaultThemePath()

			data, err = os.ReadFile(defaultPath)
			if err != nil {
				log.Println("Error reading default theme:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read default theme"})
			}
		} else {
			log.Println("Error reading theme file:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read theme"})
		}
	}

	return c.Status(fiber.StatusOK).
		Type("json").
		Send(data)
}

func UpdateTheme(c fiber.Ctx) error {
	var theme models.Theme

	if err := c.Bind().Body(&theme); err != nil {
		log.Println("Error decoding theme:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Failed to decode theme"})
	}

	if err := theme.Validate(); err != nil {
		log.Println("Theme validation error:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid theme: " + err.Error()})
	}

	data, err := json.MarshalIndent(theme, "", "  ")
	if err != nil {
		log.Println("Error encoding theme:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to encode theme"})
	}

	if err := os.WriteFile(themePath(), data, 0644); err != nil {
		log.Println("Error writing theme file:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save theme"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
