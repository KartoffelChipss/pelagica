package jellyfin

import (
	"encoding/json"
	"errors"
	"net/http"
)

type UserMeResponse struct {
	Id       string `json:"Id"`
	Name     string `json:"Name"`
	Policy   struct {
		IsAdministrator bool `json:"IsAdministrator"`
	} `json:"Policy"`
}

func AuthenticateByToken(r *http.Request) (isAdmin bool, err error) {
	jellyfinURL := r.URL.Query().Get("jellyfin_url")
	if jellyfinURL == "" {
		return false, errors.New("missing jellyfin_url query parameter")
	}

	token := r.Header.Get("Authorization")
	if token == "" {
		return false, errors.New("missing Authorization header")
	}

	req, err := http.NewRequest(
		http.MethodGet,
		jellyfinURL + "/Users/Me",
		nil,
	)
	if err != nil {
		return false, err
	}

	req.Header.Set("X-Emby-Token", token)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return false, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return false, errors.New("invalid Jellyfin token")
	}

	var user UserMeResponse
	if err := json.NewDecoder(res.Body).Decode(&user); err != nil {
		return false, err
	}

	return user.Policy.IsAdministrator, nil
}