package models

import "fmt"

type Theme struct {
	Name        string   `json:"name"`
	Author      string   `json:"author"`
	Description string   `json:"description"`
	Version     string   `json:"version"`
	Colors      Colors   `json:"colors"`
	Radius      string   `json:"radius"`
	Modes       []string `json:"modes"`
}

type Colors struct {
	Light map[string]string `json:"light"`
	Dark  map[string]string `json:"dark"`
}

func (t *Theme) Validate() error {
	if t.Name == "" {
		return fmt.Errorf("name is required")
	}
	if t.Author == "" {
		return fmt.Errorf("author is required")
	}
	if t.Description == "" {
		return fmt.Errorf("description is required")
	}
	if t.Version == "" {
		return fmt.Errorf("version is required")
	}
	if len(t.Modes) == 0 {
		return fmt.Errorf("at least one mode is required")
	}

	modeSet := make(map[string]bool)
	for _, mode := range t.Modes {
		if mode != "light" && mode != "dark" {
			return fmt.Errorf("invalid mode: %s", mode)
		}
		modeSet[mode] = true
	}

	if modeSet["light"] && len(t.Colors.Light) == 0 {
		return fmt.Errorf("light colors are required when light mode is specified")
	}
	if modeSet["dark"] && len(t.Colors.Dark) == 0 {
		return fmt.Errorf("dark colors are required when dark mode is specified")
	}

	return nil
}
