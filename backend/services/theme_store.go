package services

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"sync"

	"pelagica-backend/models"

	"github.com/google/uuid"
)

type ThemeStore struct {
	dir    string
	themes map[string]models.Theme
	mu     sync.RWMutex
}

func NewThemeStore(dir string) (*ThemeStore, error) {
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	store := &ThemeStore{
		dir:    dir,
		themes: make(map[string]models.Theme),
	}

	if err := store.loadAll(); err != nil {
		return nil, err
	}

	return store, nil
}

func (s *ThemeStore) loadAll() error {
	files, err := os.ReadDir(s.dir)
	if err != nil {
		return err
	}

	for _, file := range files {
		if file.IsDir() || filepath.Ext(file.Name()) != ".json" {
			continue
		}

		id := file.Name()[:len(file.Name())-len(".json")]
		path := filepath.Join(s.dir, file.Name())

		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		var theme models.Theme
		if err := json.Unmarshal(data, &theme); err != nil {
			continue
		}

		s.themes[id] = theme
	}

	return nil
}

func (s *ThemeStore) GetAll() []models.ThemeSummary {
	s.mu.RLock()
	defer s.mu.RUnlock()

	result := make([]models.ThemeSummary, 0, len(s.themes))

	for id, theme := range s.themes {
		result = append(result, models.ThemeSummary{
			ID:      id,
			Name:    theme.Name,
			Version: theme.Version,
			Author:  theme.Author,
		})
	}

	return result
}

func (s *ThemeStore) Get(id string) (models.Theme, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	theme, ok := s.themes[id]
	if !ok {
		return models.Theme{}, errors.New("theme not found")
	}

	return theme, nil
}

func (s *ThemeStore) Write(id string, theme models.Theme) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if id == "" {
		id = uuid.New().String()
	}

	data, err := json.MarshalIndent(theme, "", "  ")
	if err != nil {
		return "", err
	}

	path := filepath.Join(s.dir, id+".json")

	if err := os.WriteFile(path, data, 0644); err != nil {
		return "", err
	}

	s.themes[id] = theme

	return id, nil
}

func (s *ThemeStore) Delete(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.themes[id]; !ok {
		return errors.New("theme not found")
	}

	path := filepath.Join(s.dir, id+".json")

	if err := os.Remove(path); err != nil {
		return err
	}

	delete(s.themes, id)

	return nil
}
