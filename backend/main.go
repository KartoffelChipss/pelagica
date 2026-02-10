package main

import (
	"log"
	"net/http"
	"os"
	"pelagica-backend/handlers"
)

func getPort() string {
	envPort := os.Getenv("PORT")
	if envPort == "" {
		return ":4321"
	}
	return ":" + envPort
}

func main() {
	mux := http.NewServeMux()

	configHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetConfig(w, r)

		case http.MethodPost:
			handlers.AuthMiddleware(
				http.HandlerFunc(handlers.UpdateConfig),
			).ServeHTTP(w, r)

		case http.MethodOptions:
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	themeHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetTheme(w, r)

		//case http.MethodPost:
		//	handlers.AuthMiddleware(
		//		http.HandlerFunc(handlers.UpdateTheme),
		//	).ServeHTTP(w, r)

		case http.MethodPost:
			handlers.UpdateTheme(w, r)

		case http.MethodOptions:
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.Handle("/api/config", configHandler)
	mux.Handle("/api/theme", themeHandler)

	log.Println("Server starting on " + getPort())

	log.Fatal(http.ListenAndServe(getPort(), mux))

}
