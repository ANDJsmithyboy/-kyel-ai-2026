# Ñkyel AI — Security & Compliance Audit Checklist
**SmartANDJ AI Technologies** · **Chief Security Officer / Principal Engineer**

---

## 1. Matrice de Sécurité & Conformité Bêta / Google Review

| Domaine | Mesure Implémentée | Statut | Vérification |
|---|---|---|---|
| **WAF & DDoS** | Cloudflare WAF, Rate Limiting & Turnstile | ✅ Actif | Validé sur proxy CDN |
| **Authentification** | Clerk RS256 JWKS, vérification serveur stricte | ✅ Actif | Aucune confiance dans le client |
| **Protection Session** | Cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict` | ✅ Actif | `google_demo.py` & Clerk |
| **Secrets & Clés** | Aucun secret en clair dans git, multi-key rotator | ✅ Actif | `key_rotator.py` & `.env` |
| **Reviewer Token** | Vérification en temps constant par hash SHA-256 | ✅ Actif | `hmac.compare_digest` |
| **Stockage & R2** | URLs signées pré-expirantes, MIME sniffing filtré | ✅ Actif | `r2_storage_service.py` |
| **Injection & Guardrails**| Validation Pydantic stricte, sanitisation des prompts | ✅ Actif | `moderation_service.py` |
| **Cloisonnement** | RLS Neon, namespaces étanches (`user/{id}/global`) | ✅ Actif | `neon_memory_backend.py` |
| **Télémétrie & Logs** | Masquage des tokens et secrets, idempotence | ✅ Actif | `beta_events` & Sentry |
| **Anti-Indexation** | `noindex, nofollow`, `X-Robots-Tag: noindex, nofollow` | ✅ Actif | Sur routes `/api/v1/google-demo` |

---

## 2. Rétention des Données & Consentement RGPD / APDP

1. **Consentement Explicite** : Recueil horodaté du consentement aux Conditions d'Utilisation et à la Politique de Confidentialité.
2. **Droit à l'Oubli** : Route de suppression totale de compte (`/delete-account`) déclenchant la purge en cascade dans Neon, Qdrant et R2.
3. **Export de Données** : Route d'exportation RGPD (`/export-data`) téléchargeant l'ensemble des métadonnées, messages et fichiers de l'utilisateur au format JSON/ZIP.
4. **Cloisonnement Absolu** : Les données des 100 testeurs de la bêta ne sont jamais visibles ni accessibles depuis l'instance de démonstration Google (`demo.nkyel.smartandjai.com`).
