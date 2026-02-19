package handlers

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"

	"pelagica-backend/models"

	"github.com/gofiber/fiber/v3"
)

func configPath() string {
	path := os.Getenv("CONFIG_PATH")
	if path == "" {
		path = "config.json"
	}
	return path
}

func GetConfig(c fiber.Ctx) error {
	path := configPath()

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			defaultConfig := []byte(`{}`)

			if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
				log.Println("Error creating config directory:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to create config directory"})
			}

			if err := os.WriteFile(path, defaultConfig, 0644); err != nil {
				log.Println("Error creating config file:", err)
				return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save config"})
			}

			data = defaultConfig
		} else {
			log.Println("Error reading config file:", err)
			return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to read config file"})
		}
	}

	return c.Status(fiber.StatusOK).
		Type("json").
		Send(data)
}

func UpdateConfig(c fiber.Ctx) error {
	var cfg models.AppConfig

	if err := c.Bind().Body(&cfg); err != nil {
		log.Println("Error decoding config:", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIError{Error: "Invalid config"})
	}

	if cfg.ItemPage != nil {
		if cfg.ItemPage.FavoriteButton == nil {
			cfg.ItemPage.FavoriteButton = []models.BaseItemKind{}
		}
		if cfg.ItemPage.DeleteButton == nil {
			cfg.ItemPage.DeleteButton = []models.BaseItemKind{}
		}
		if cfg.ItemPage.DetailBadges == nil {
			cfg.ItemPage.DetailBadges = []models.DetailBadge{}
		}
	}

	data, err := json.MarshalIndent(cfg, "", "    ")
	if err != nil {
		log.Println("Error encoding config:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to encode config"})
	}

	if err := os.WriteFile(configPath(), data, 0644); err != nil {
		log.Println("Error writing config file:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(models.APIError{Error: "Failed to save config"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
