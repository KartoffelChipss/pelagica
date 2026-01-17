package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
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
    data, err := os.ReadFile(configPath())
    if err != nil {
        log.Println("Error reading config file:", err)
        http.Error(w, "Failed to read config", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
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

    data, _ := json.MarshalIndent(cfg, "", "    ")
    
    // Write directly to config file because docker seems to have an issue with renaming files on mounted volumes
    if err := os.WriteFile(configPath(), data, 0644); err != nil {
        log.Println("Error writing config file:", err)
        http.Error(w, "Failed to save config", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}