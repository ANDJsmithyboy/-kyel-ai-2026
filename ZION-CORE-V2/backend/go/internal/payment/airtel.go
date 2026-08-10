/* GabomaGPT · airtel.go
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Intégration Airtel Money API — Paiements mobile Gabon */

package payment

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

// AirtelMoneyClient — client pour l'API Airtel Money
type AirtelMoneyClient struct {
	clientID     string
	clientSecret string
	baseURL      string
	httpClient   *http.Client
	accessToken  string
	tokenExpiry  time.Time
}

// NewAirtelMoneyClient — initialise le client Airtel Money
func NewAirtelMoneyClient() *AirtelMoneyClient {
	env := os.Getenv("AIRTEL_MONEY_ENV")
	baseURL := "https://openapi.airtel.africa"
	if env == "sandbox" {
		baseURL = "https://openapiuat.airtel.africa"
	}

	return &AirtelMoneyClient{
		clientID:     os.Getenv("AIRTEL_MONEY_CLIENT_ID"),
		clientSecret: os.Getenv("AIRTEL_MONEY_CLIENT_SECRET"),
		baseURL:      baseURL,
		httpClient:   &http.Client{Timeout: 30 * time.Second},
	}
}

// Authenticate — obtient un token d'accès OAuth2 Airtel Money
func (c *AirtelMoneyClient) Authenticate() error {
	if time.Now().Before(c.tokenExpiry) && c.accessToken != "" {
		return nil
	}

	payload := map[string]string{
		"client_id":     c.clientID,
		"client_secret": c.clientSecret,
		"grant_type":    "client_credentials",
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("erreur sérialisation auth: %w", err)
	}

	req, err := http.NewRequest("POST", c.baseURL+"/auth/oauth2/token", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("erreur création requête auth: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("erreur appel auth Airtel: %w", err)
	}
	defer resp.Body.Close()

	var result struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("erreur décodage auth: %w", err)
	}

	c.accessToken = result.AccessToken
	c.tokenExpiry = time.Now().Add(time.Duration(result.ExpiresIn) * time.Second)

	return nil
}

// CollectPayment — initie une collecte de paiement Airtel Money
func (c *AirtelMoneyClient) CollectPayment(phone, amount, txnRef, narration string) (*PaymentResponse, error) {
	if err := c.Authenticate(); err != nil {
		return nil, err
	}

	payload := map[string]interface{}{
		"reference": narration,
		"subscriber": map[string]string{
			"country":  "GA",
			"currency": "XAF",
			"msisdn":   phone,
		},
		"transaction": map[string]string{
			"amount":   amount,
			"country":  "GA",
			"currency": "XAF",
			"id":       txnRef,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("erreur sérialisation paiement: %w", err)
	}

	req, err := http.NewRequest("POST", c.baseURL+"/merchant/v1/payments/", bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("erreur création requête paiement: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.accessToken)
	req.Header.Set("X-Country", "GA")
	req.Header.Set("X-Currency", "XAF")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erreur appel paiement Airtel: %w", err)
	}
	defer resp.Body.Close()

	var result PaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("erreur décodage paiement: %w", err)
	}

	return &result, nil
}

// PaymentResponse — réponse de l'API Airtel Money
type PaymentResponse struct {
	Data struct {
		Transaction struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"transaction"`
	} `json:"data"`
	Status struct {
		Code       string `json:"code"`
		Message    string `json:"message"`
		ResultCode string `json:"result_code"`
		Success    bool   `json:"success"`
	} `json:"status"`
}
