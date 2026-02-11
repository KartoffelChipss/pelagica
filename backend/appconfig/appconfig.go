package appconfig

import (
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func Setup(app *fiber.App) {
	app.Use(func(c fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.Next()
	})

	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${status} - ${method} ${path} (${latency}) - ${ip}\n",
		TimeFormat: "2006-01-02 15:04:05",
	}))
}
