package main

import (
	"log"
	"os"
	"pelagica-backend/appconfig"
	"pelagica-backend/handlers"
	"strings"

	"github.com/gofiber/fiber/v3"
)

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4321"
	}
	return ":" + port
}

func isAuthEnabled() bool {
	enableAuth := os.Getenv("ENABLE_AUTH")
	return strings.ToLower(enableAuth) == "true"
}

func main() {
	app := fiber.New()
	appconfig.Setup(app)

	var protected fiber.Handler
	if isAuthEnabled() {
		protected = handlers.AuthMiddleware
	} else {
		protected = func(c fiber.Ctx) error { return c.Next() }
	}

	api := app.Group("/api")

	api.Get("/config", handlers.GetConfig)
	api.Post("/config", protected, handlers.UpdateConfig)

	api.Get("/theme", handlers.GetTheme)
	api.Post("/theme", protected, handlers.UpdateTheme)

	log.Println("Server starting on " + getPort())
	log.Fatal(app.Listen(getPort()))
}
