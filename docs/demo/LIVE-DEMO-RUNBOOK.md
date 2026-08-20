# LIVE-DEMO-RUNBOOK.md

## Déploiement et Accès Démo (RunPod CPU Pod)

**Contexte** : RunPod CPU Pod (On-Demand), 4 à 8 vCPU, 16 GB RAM.

1. **Build et Push Image** :
   ```bash
   docker build --platform linux/amd64 -f Dockerfile.demo -t REGISTRY/nkyel-demo:2026-08-19-p0 .
   docker push REGISTRY/nkyel-demo:2026-08-19-p0
   ```

2. **Template RunPod** :
   - Compute type : CPU
   - Container image : `REGISTRY/nkyel-demo:2026-08-19-p0`
   - Disk : 20 GB
   - Variables d'environnement :
     - `DEMO_MODE=true`
     - `NKYEL_MCP_FETCH_ENABLED=true`
     - `NKYEL_LIVE_EXECUTION=true`
     - `GEMINI_API_KEY=...`
   - Port exposé : `8080/http`

3. **Validation Post-Déploiement** :
   - URL de santé : `https://<POD_ID>-8080.proxy.runpod.net/api/v1/nkyel/health`
   - URL publique : `https://<POD_ID>-8080.proxy.runpod.net/`
   - Test : Lancer `scripts/demo-smoke-test.sh` pointant vers l'URL publique.

4. **Clerk (Auth)** :
   - Si Clerk est actif, ajouter `https://<POD_ID>-8080.proxy.runpod.net` aux origines de redirection / callback.

5. **Lancement Live** :
   - Ouvrir le lien dans un navigateur vierge (profil séparé).
   - Exécuter la mission officielle.
