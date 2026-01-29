package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"pelagica-backend/models"
)

func configPath() string {
    configPath := os.Getenv("CONFIG_PATH")
    if configPath == "" {
        configPath = "config.json"
    }
    return configPath
}

func GetConfig(w http.ResponseWriter, r *http.Request) {
    path := configPath()

    data, err := os.ReadFile(path)
    if err != nil {
        if os.IsNotExist(err) {
            defaultConfig := []byte(`{}`)

            // ensure the directory exists
            if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
                log.Println("Error creating config directory:", err)
                http.Error(w, "Failed to create config directory", http.StatusInternalServerError)
                return
            }

            if err := os.WriteFile(path, defaultConfig, 0644); err != nil {
                log.Println("Error creating config file:", err)
                http.Error(w, "Failed to create config", http.StatusInternalServerError)
                return
            }

            data = defaultConfig
        } else {
            log.Println("Error reading config file:", err)
            http.Error(w, "Failed to read config", http.StatusInternalServerError)
            return
        }
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(data)
}

func UpdateConfig(w http.ResponseWriter, r *http.Request) {
    var cfg models.AppConfig

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()

    if err := dec.Decode(&cfg); err != nil {
		log.Println("Error decoding config:", err)
        http.Error(w, "Invalid JSON: " + err.Error(), http.StatusBadRequest)
        return
    }

    // Initialize empty arrays to save them in json as [] instead just ignoring them
    if cfg.ItemPage != nil {
        if cfg.ItemPage.FavoriteButton == nil {
            cfg.ItemPage.FavoriteButton = []models.BaseItemKind{}
        }
        if cfg.ItemPage.DeleteButton == nil {
            cfg.ItemPage.DeleteButton = []models.BaseItemKind{}
        }
        if cfg.ItemPage.DetailBadges == nil {
            cfg.ItemPage.DetailBadges = []models.DetailBadge{}
        }
    }

    data, _ := json.MarshalIndent(cfg, "", "    ")
    
    // Write directly to config file because docker seems to have an issue with renaming files on mounted volumes
    if err := os.WriteFile(configPath(), data, 0644); err != nil {
        log.Println("Error writing config file:", err)
        http.Error(w, "Failed to save config", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}