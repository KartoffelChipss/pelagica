package main

import (
	"log"
	"net/http"
	"os"
	"pelagica-backend/handlers"
)

func getPort() string {
	envPort :=  os.Getenv("PORT")
	if envPort == "" {
		return ":4321"
	}
	return ":" + envPort
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/config", func (w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		switch r.Method {
		case http.MethodGet:
			handlers.GetConfig(w, r)
		case http.MethodPost:
			handlers.UpdateConfig(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	log.Println("Server starting on " + getPort())

	log.Fatal(http.ListenAndServe(getPort(), mux))

}