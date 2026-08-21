# Guide de Dépannage & Résolution des Incidents — Ñkyel AI

> **SmartANDJ AI Technologies** · **Fondateur** : Daniel Jonathan ANDJ

---

## 1. Clés d'Environnement Manquantes

### `TAVILY_API_KEY absente`
* **Impact** : Ñkyel Wide Research désactivé.
* **Solution** : Ajouter la clé dans `.env` côté backend et relancer le serveur (`make dev`).

### `DATABASE_URL absente`
* **Impact** : Utilisation du mode éphémère SQLite (`events.sqlite3`).
* **Solution** : Renseigner l'URI de connexion Neon PostgreSQL dans `.env`.

---

## 2. Reconnexion SSE & Perte Réseau

En cas de déconnexion réseau ou coupure bas débit :
* Le client `ZION-CORE-V2` tente une reconnexion automatique avec reprise depuis le dernier numéro de séquence (`sequence`).
* L'état de la mission et le WorkGraph sont restaurés depuis le dernier checkpoint enregistré dans Neon.
