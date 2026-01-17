package handlers

import (
	"log"
	"net/http"

	"pelagica-backend/jellyfin"
)

func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ok, err := jellyfin.AuthenticateByToken(r)

        if err != nil {
            log.Println("Authentication error:", err)
            http.Error(w, "Forbidden: " + err.Error(), http.StatusForbidden)
            return
        }

        if !ok {
            log.Println("Authentication failed: admin access required")
            http.Error(w, "Forbidden: admin access required", http.StatusForbidden)
            return
        }

        next.ServeHTTP(w, r)
    })
}