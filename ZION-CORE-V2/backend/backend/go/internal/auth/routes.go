/* GabomaGPT · routes.go (auth)
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Routes d'authentification — OTP + Email + Google OAuth */

package auth

import (
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes — enregistre les routes auth dans le groupe Fiber
func RegisterRoutes(router fiber.Router) {
	router.Post("/otp/send", handleSendOTP)
	router.Post("/otp/verify", handleVerifyOTP)
	router.Post("/login", handleLogin)
	router.Post("/register", handleRegister)
	router.Get("/me", handleGetMe)
	router.Post("/refresh", handleRefreshToken)
}

// handleSendOTP — envoie un code OTP au numéro de téléphone
func handleSendOTP(c *fiber.Ctx) error {
	type Request struct {
		Phone string `json:"phone" validate:"required"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Numéro de téléphone requis"})
	}

	if req.Phone == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Numéro de téléphone vide"})
	}

	// TODO: Initialiser OTPService avec Redis et appeler SendOTP
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Code OTP envoyé avec succès",
	})
}

// handleVerifyOTP — vérifie le code OTP et retourne un JWT
func handleVerifyOTP(c *fiber.Ctx) error {
	type Request struct {
		Phone string `json:"phone" validate:"required"`
		Code  string `json:"code" validate:"required"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	// TODO: Vérifier OTP via Redis, créer/récupérer utilisateur, générer JWT
	token, err := GenerateToken("user-id", req.Phone, "user", "free")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur génération token"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"token":   token,
	})
}

// handleLogin — connexion par email + mot de passe
func handleLogin(c *fiber.Ctx) error {
	type Request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	// TODO: Vérifier email/password dans la base de données
	token, err := GenerateToken("user-id", "", "user", "free")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur génération token"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"token":   token,
	})
}

// handleRegister — inscription nouvel utilisateur
func handleRegister(c *fiber.Ctx) error {
	type Request struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
		Language string `json:"language"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	// TODO: Créer utilisateur dans la base de données
	token, err := GenerateToken("new-user-id", req.Phone, "pending", "free")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur génération token"})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"token":   token,
		"message": "Compte créé avec succès",
	})
}

// handleGetMe — retourne les informations de l'utilisateur connecté
func handleGetMe(c *fiber.Ctx) error {
	// TODO: Extraire le token de l'en-tête Authorization et retourner l'utilisateur
	return c.JSON(fiber.Map{
		"id":   "user-id",
		"role": "user",
		"plan": "free",
	})
}

// handleRefreshToken — renouvelle un JWT expirant
func handleRefreshToken(c *fiber.Ctx) error {
	// TODO: Vérifier le token existant et en générer un nouveau
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token renouvelé",
	})
}
