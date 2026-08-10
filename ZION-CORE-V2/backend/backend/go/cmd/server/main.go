/* GabomaGPT · main.go
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Point d'entrée du microservice Go — Auth + Payments */

package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"github.com/smartandj/gabomagpt-go/internal/auth"
	"github.com/smartandj/gabomagpt-go/internal/middleware"
	"github.com/smartandj/gabomagpt-go/internal/payment"
)

func main() {
	// Charger les variables d'environnement
	_ = godotenv.Load()

	app := fiber.New(fiber.Config{
		AppName:      "GabomaGPT Auth+Pay v1.0",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares globaux
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: getEnv("CORS_ORIGINS", "*"),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Rate limiting global
	app.Use(middleware.RateLimit())

	// Routes santé
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "gabomagpt-auth-pay",
			"version": "1.0.0",
		})
	})

	// Groupe Auth
	authGroup := app.Group("/api/v1/auth")
	auth.RegisterRoutes(authGroup)

	// Groupe Paiements
	payGroup := app.Group("/api/v1/payment")
	payment.RegisterRoutes(payGroup)

	// Démarrage du serveur
	port := getEnv("GO_PORT", "8001")
	log.Printf("🚀 GabomaGPT Go Auth+Pay démarré sur le port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Erreur démarrage serveur: %v", err)
	}
}

// customErrorHandler — gestion centralisée des erreurs
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": err.Error(),
	})
}

// getEnv — récupère une variable d'environnement avec valeur par défaut
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
