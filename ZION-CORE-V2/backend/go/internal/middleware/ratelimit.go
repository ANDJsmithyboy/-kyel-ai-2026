/* GabomaGPT · ratelimit.go
   SmartANDJ AI Technologies · Constitution Zion Core
   Fondateur : Daniel Jonathan ANDJ
   Middleware de rate limiting par IP — protection API */

package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimit — retourne un middleware Fiber de rate limiting
func RateLimit() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:               60,
		Expiration:        1 * time.Minute,
		LimiterMiddleware: limiter.SlidingWindow{},
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error":   true,
				"message": "Trop de requêtes — réessayez dans quelques instants",
			})
		},
	})
}
