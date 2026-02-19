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

	handlers.InitThemeStore()

	var protected fiber.Handler
	if isAuthEnabled() {
		protected = handlers.AuthMiddleware
	} else {
		protected = func(c fiber.Ctx) error { return c.Next() }
	}

	api := app.Group("/api")

	api.Get("/config", handlers.GetConfig)
	api.Post("/config", protected, handlers.UpdateConfig)

	api.Get("/themes", handlers.GetThemes)
	api.Post("/themes", protected, handlers.CreateTheme)
	api.Get("/themes/:id", handlers.GetTheme)
	api.Put("/themes/:id", protected, handlers.UpdateTheme)
	api.Delete("/themes/:id", protected, handlers.DeleteTheme)
	api.Post("/themes/:id/install", protected, handlers.InstallTheme)

	log.Println("Server starting on " + getPort())
	log.Fatal(app.Listen(getPort()))
}
