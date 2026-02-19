package models

type ThemeRepoTheme struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Version     string   `json:"version"`
	Author      string   `json:"author"`
	Path        string   `json:"path"`
	Previews    []string `json:"previews"`
}

type ThemeRepo struct {
	Themes []ThemeRepoTheme `json:"themes"`
}
