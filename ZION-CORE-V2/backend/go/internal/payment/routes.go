/* GabomaGPT · routes.go (payment)
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Routes de paiement — Airtel Money + Moov (SUMB) */

package payment

import (
	"github.com/gofiber/fiber/v2"
)

// Plans GabomaGPT — tarification en XAF
var plans = map[string]PlanConfig{
	"free": {
		Name:     "Gratuit",
		Price:    0,
		Currency: "XAF",
		Mode:     "flash",
		Limit:    20,
	},
	"pro": {
		Name:     "Pro",
		Price:    2500,
		Currency: "XAF",
		Mode:     "pro",
		Limit:    200,
	},
	"bp": {
		Name:     "Black Panther",
		Price:    7500,
		Currency: "XAF",
		Mode:     "bp",
		Limit:    -1,
	},
}

// PlanConfig — configuration d'un plan tarifaire
type PlanConfig struct {
	Name     string `json:"name"`
	Price    int    `json:"price"`
	Currency string `json:"currency"`
	Mode     string `json:"mode"`
	Limit    int    `json:"limit"`
}

// RegisterRoutes — enregistre les routes de paiement dans le groupe Fiber
func RegisterRoutes(router fiber.Router) {
	router.Get("/plans", handleGetPlans)
	router.Post("/airtel/initiate", handleAirtelInitiate)
	router.Post("/airtel/callback", handleAirtelCallback)
	router.Post("/moov/initiate", handleMoovInitiate)
	router.Post("/moov/callback", handleMoovCallback)
	router.Get("/status/:txn_id", handlePaymentStatus)
}

// handleGetPlans — retourne la liste des plans disponibles
func handleGetPlans(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"plans":   plans,
	})
}

// handleAirtelInitiate — initie un paiement Airtel Money
func handleAirtelInitiate(c *fiber.Ctx) error {
	type Request struct {
		Phone  string `json:"phone"`
		PlanID string `json:"plan_id"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	plan, exists := plans[req.PlanID]
	if !exists {
		return c.Status(400).JSON(fiber.Map{"error": "Plan inconnu"})
	}

	if plan.Price == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Le plan gratuit ne nécessite pas de paiement"})
	}

	// TODO: Créer une transaction dans la base de données
	// TODO: Appeler AirtelMoneyClient.CollectPayment

	return c.JSON(fiber.Map{
		"success":        true,
		"transaction_id": "txn_placeholder",
		"amount":         plan.Price,
		"currency":       plan.Currency,
		"message":        "Confirmez le paiement sur votre téléphone",
	})
}

// handleAirtelCallback — webhook de confirmation Airtel Money
func handleAirtelCallback(c *fiber.Ctx) error {
	// TODO: Vérifier la signature du callback
	// TODO: Mettre à jour le statut de la transaction
	// TODO: Activer le plan de l'utilisateur
	return c.JSON(fiber.Map{"success": true})
}

// handleMoovInitiate — initie un paiement Moov via SUMB
func handleMoovInitiate(c *fiber.Ctx) error {
	type Request struct {
		Phone  string `json:"phone"`
		PlanID string `json:"plan_id"`
	}

	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	plan, exists := plans[req.PlanID]
	if !exists {
		return c.Status(400).JSON(fiber.Map{"error": "Plan inconnu"})
	}

	if plan.Price == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Le plan gratuit ne nécessite pas de paiement"})
	}

	// TODO: Intégrer l'API Moov/SUMB
	return c.JSON(fiber.Map{
		"success":        true,
		"transaction_id": "moov_txn_placeholder",
		"amount":         plan.Price,
		"currency":       plan.Currency,
		"message":        "Confirmez le paiement Moov sur votre téléphone",
	})
}

// handleMoovCallback — webhook de confirmation Moov
func handleMoovCallback(c *fiber.Ctx) error {
	// TODO: Vérifier et activer le plan
	return c.JSON(fiber.Map{"success": true})
}

// handlePaymentStatus — vérifie le statut d'une transaction
func handlePaymentStatus(c *fiber.Ctx) error {
	txnID := c.Params("txn_id")
	if txnID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "ID transaction requis"})
	}

	// TODO: Chercher la transaction dans la base de données
	return c.JSON(fiber.Map{
		"transaction_id": txnID,
		"status":         "pending",
	})
}
