package main

import (
	"log"
	"os"
	"pelagica-backend/handlers"

	"github.com/gofiber/fiber/v3"
)

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4321"
	}
	return ":" + port
}

func main() {
	app := fiber.New()

	api := app.Group("/api")

	api.Get("/config", handlers.GetConfig)
	api.Post("/config", handlers.AuthMiddleware, handlers.UpdateConfig)

	api.Get("/theme", handlers.GetTheme)
	api.Post("/theme", handlers.AuthMiddleware, handlers.UpdateTheme)

	log.Println("Server starting on " + getPort())
	log.Fatal(app.Listen(getPort()))
}
