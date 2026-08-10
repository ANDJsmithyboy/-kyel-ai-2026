/* GabomaGPT · otp.go
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Système OTP par SMS — Africa's Talking API
   1 compte max par numéro de téléphone (anti-abus production) */

package auth

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// OTPService — service d'envoi et vérification OTP via Africa's Talking
type OTPService struct {
	redis    *redis.Client
	apiKey   string
	username string
}

// NewOTPService — initialise le service OTP avec Redis + Africa's Talking
func NewOTPService(redisClient *redis.Client) *OTPService {
	return &OTPService{
		redis:    redisClient,
		apiKey:   os.Getenv("AFRICAS_TALKING_API_KEY"),
		username: os.Getenv("AFRICAS_TALKING_USERNAME"),
	}
}

// GenerateOTP — génère un code OTP 6 chiffres aléatoire cryptographiquement sûr
func (s *OTPService) GenerateOTP() (string, error) {
	code := ""
	for i := 0; i < 6; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", fmt.Errorf("erreur génération OTP: %w", err)
		}
		code += n.String()
	}
	return code, nil
}

// SendOTP — envoie un code OTP par SMS via Africa's Talking
func (s *OTPService) SendOTP(ctx context.Context, phone string) (string, error) {
	// Vérifier le rate limiting (max 3 OTP par heure par numéro)
	rateLimitKey := fmt.Sprintf("otp:ratelimit:%s", phone)
	count, _ := s.redis.Get(ctx, rateLimitKey).Int()
	if count >= 3 {
		return "", fmt.Errorf("trop de tentatives OTP — réessayez dans 1 heure")
	}

	// Générer le code OTP
	code, err := s.GenerateOTP()
	if err != nil {
		return "", err
	}

	// Stocker dans Redis avec expiration 5 minutes
	otpKey := fmt.Sprintf("otp:%s", phone)
	if err := s.redis.Set(ctx, otpKey, code, 5*time.Minute).Err(); err != nil {
		return "", fmt.Errorf("erreur stockage OTP: %w", err)
	}

	// Incrémenter le compteur rate limit
	s.redis.Incr(ctx, rateLimitKey)
	s.redis.Expire(ctx, rateLimitKey, 1*time.Hour)

	// Envoyer le SMS via Africa's Talking
	if err := s.sendSMS(phone, fmt.Sprintf(
		"GabomaGPT — Votre code de vérification : %s\nValide 5 minutes.\nNe partagez ce code avec personne.",
		code,
	)); err != nil {
		return "", fmt.Errorf("erreur envoi SMS: %w", err)
	}

	return code, nil
}

// VerifyOTP — vérifie le code OTP saisi par l'utilisateur
func (s *OTPService) VerifyOTP(ctx context.Context, phone, code string) (bool, error) {
	otpKey := fmt.Sprintf("otp:%s", phone)
	storedCode, err := s.redis.Get(ctx, otpKey).Result()
	if err == redis.Nil {
		return false, fmt.Errorf("code OTP expiré ou inexistant")
	}
	if err != nil {
		return false, fmt.Errorf("erreur vérification OTP: %w", err)
	}

	if storedCode != code {
		return false, fmt.Errorf("code OTP incorrect")
	}

	// Supprimer le code utilisé
	s.redis.Del(ctx, otpKey)

	return true, nil
}

// sendSMS — envoi effectif du SMS via l'API Africa's Talking
func (s *OTPService) sendSMS(to, message string) error {
	apiURL := "https://api.africastalking.com/version1/messaging"
	if s.username == "sandbox" {
		apiURL = "https://api.sandbox.africastalking.com/version1/messaging"
	}

	data := url.Values{}
	data.Set("username", s.username)
	data.Set("to", to)
	data.Set("message", message)
	data.Set("from", "GabomaGPT")

	req, err := http.NewRequest("POST", apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("apiKey", s.apiKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("Africa's Talking API erreur: status %d", resp.StatusCode)
	}

	return nil
}
