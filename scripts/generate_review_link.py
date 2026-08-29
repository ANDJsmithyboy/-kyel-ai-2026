import requests

def generate_google_review_link():
    url = "http://localhost:8080/api/v1/review/invitations"
    payload = {
        "audience": "google_reviewers",
        "expires_in_days": 35,
        "admin_secret": "NKYEL_ADMIN_1337_SECURE"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print("\n✅ LIEN PRIVÉ GOOGLE REVIEW GÉNÉRÉ AVEC SUCCÈS")
        print("="*60)
        print(f"Lien à fournir à Google : https://nkyel.smartandjai.com{data['url']}")
        print(f"Expire le              : {data['expires_at']}")
        print(f"Token secret interne   : {data['invite_token']}")
        print("="*60)
    except Exception as e:
        print(f"❌ Erreur lors de la génération du lien: {e}")
        print("Assurez-vous que le backend Ñkyel tourne sur http://localhost:8080")

if __name__ == "__main__":
    generate_google_review_link()
