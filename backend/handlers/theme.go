package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"pelagica-backend/models"
)

func themePath() string {
	configPath := os.Getenv("THEME_PATH")
	if configPath == "" {
		configPath = "theme.json"
	}
	return configPath
}

func defaultThemePath() string {
	defaultPath := os.Getenv("DEFAULT_THEME_PATH")
	if defaultPath == "" {
		defaultPath = "default.default.theme.json"
	}
	return defaultPath
}

func GetTheme(w http.ResponseWriter, r *http.Request) {
	path := themePath()

	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			defaultPath := defaultThemePath()

			data, err = os.ReadFile(defaultPath)
			if err != nil {
				log.Println("Error reading default theme:", err)
				http.Error(w, "Default theme not found", http.StatusInternalServerError)
				return
			}
		} else {
			log.Println("Error reading theme file:", err)
			http.Error(w, "Failed to read theme", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func UpdateTheme(w http.ResponseWriter, r *http.Request) {
	var theme models.Theme

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

	if err := dec.Decode(&theme); err != nil {
		log.Println("Error decoding theme:", err)
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err := theme.Validate(); err != nil {
		log.Println("Theme validation error:", err)
		http.Error(w, "Theme validation error: "+err.Error(), http.StatusBadRequest)
		return
	}

	data, err := json.MarshalIndent(theme, "", "  ")
	if err != nil {
		log.Println("Error encoding theme:", err)
		http.Error(w, "Failed to encode theme", http.StatusInternalServerError)
		return
	}

	if err := os.WriteFile(themePath(), data, 0644); err != nil {
		log.Println("Error writing theme file:", err)
		http.Error(w, "Failed to save theme", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
