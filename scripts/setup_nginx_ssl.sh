#!/usr/bin/env bash
# ==============================================================================
# ÑKYEL AI — CONFIGURATION NGINX REVERSE PROXY & SSL (CERTBOT LET'S ENCRYPT)
# Domaine API : api.nkyel.smartandjai.com -> http://127.0.0.1:8000
# SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo "🌐 1. CONFIGURATION DU VHOST NGINX POUR L'API"
echo "=========================================================="

cat << 'EOF' > /etc/nginx/sites-available/api.nkyel.smartandjai.com.conf
server {
    listen 80;
    listen [::]:80;
    server_name api.nkyel.smartandjai.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Configuration indispensable pour les flux SSE / AI Streaming
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
    }
}
EOF

# Activer le site et tester la configuration
ln -sf /etc/nginx/sites-available/api.nkyel.smartandjai.com.conf /etc/nginx/sites-enabled/
nginx -t

echo "=========================================================="
echo "🚀 2. DÉMARRAGE ET ACTIVATION DE NGINX"
echo "=========================================================="
systemctl restart nginx
systemctl enable nginx

echo "=========================================================="
echo "🔒 3. GÉNÉRATION DU CERTIFICAT SSL LET'S ENCRYPT (HTTPS)"
echo "=========================================================="
if ! command -v certbot &> /dev/null; then
    echo "[*] Installation de certbot et python3-certbot-nginx..."
    apt-get update -y
    apt-get install -y certbot python3-certbot-nginx
fi

echo "[*] Obtention du certificat SSL pour api.nkyel.smartandjai.com..."
certbot --nginx \
    -d api.nkyel.smartandjai.com \
    --non-interactive \
    --agree-tos \
    --register-unsafely-without-email \
    --redirect || {
        echo "⚠️ Tentative interactive de certbot si échec non-interactif..."
        certbot --nginx -d api.nkyel.smartandjai.com
    }

echo "=========================================================="
echo "🔄 4. RECHARGEMENT FINAL DE NGINX"
echo "=========================================================="
systemctl reload nginx

echo "=========================================================="
echo "🔍 5. VÉRIFICATION DU HTTPS EN LOCAL ET PUBLIC"
echo "=========================================================="
curl -s -I https://api.nkyel.smartandjai.com/health || echo "Test DNS public en cours..."

echo ""
echo "=========================================================="
echo "✅ NGINX ET SSL SONT ACTIVÉS AVEC SUCCÈS SUR LE PORT 443 !"
echo "=========================================================="
