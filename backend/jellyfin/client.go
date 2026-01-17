package jellyfin

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type AuthRequest struct {
    Username string `json:"Username"`
    Pw       string `json:"Pw"`
}

func Authenticate(serverURL, username, password string) (bool, error) {
    payload := AuthRequest{Username: username, Pw: password}
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest(
        "POST",
        serverURL+"/Users/AuthenticateByName",
        bytes.NewBuffer(body),
    )

    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return false, err
    }
    defer resp.Body.Close()

    return resp.StatusCode == 200, nil
}