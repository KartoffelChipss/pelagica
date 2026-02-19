package handlers

import (
	"log"
	"pelagica-backend/models"

	"pelagica-backend/jellyfin"

	"github.com/gofiber/fiber/v3"
)

func AuthMiddleware(c fiber.Ctx) error {
	ok, err := jellyfin.AuthenticateByToken(c)

	if err != nil {
		log.Println("Authentication error:", err)
		return c.Status(fiber.StatusForbidden).JSON(models.APIError{Error: "Jellyfin Authentication failed"})
	}

	if !ok {
		log.Println("Authentication failed: admin access required")
		return c.Status(fiber.StatusForbidden).JSON(models.APIError{Error: "Admin access required"})
	}

	return c.Next()
}
