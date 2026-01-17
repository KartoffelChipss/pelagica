package handlers

import (
	"net/http"

	"pelagica-backend/jellyfin"
)

func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        ok, err := jellyfin.AuthenticateByToken(r)

        if err != nil || !ok {
            http.Error(w, "Forbidden", http.StatusForbidden)
            return
        }

        next.ServeHTTP(w, r)
    })
}