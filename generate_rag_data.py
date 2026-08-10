import json
import random

# Données pour les variations
amounts = ["1000", "2000", "5000", "10000", "15000", "20000", "50000", "100000"]
names = ["Jean", "Marie", "Marc", "Paul", "Sophie", "Lucie", "Kodia", "Ndong", "Ondo", "Mba", "Obame", "Nzoghe"]
numbers = ["060112233", "066445566", "062998877", "065112233", "066001122"]
bill_types = ["SEEG", "Canal+", "Startimes", "Internet"]
greetings = ["M'bolo", "Mbôlô", "Bonjour", "Salut"]

# Modèles Fang
fang_templates = [
    {
        "intent": "transfer",
        "q": "{greeting}, ma kômbô lom {amount} FCFA asu {name}.",
        "a": "M'bolo ! Ma lere zene asu lom {amount} FCFA be {name}. Ye ô ne mvo'o ? (Veuillez confirmer l'envoi de {amount} FCFA à {name} avec votre code PIN.)"
    },
    {
        "intent": "transfer",
        "q": "Ma kômbô lom mǒn. {amount} asu numéro {number}.",
        "a": "D'accord. Ma kômbô lom {amount} FCFA asu {number}. Confirmez avec votre code secret."
    },
    {
        "intent": "balance",
        "q": "Nsili asu mǒn wom y'e Moov Money.",
        "a": "Pour consulter votre solde, veuillez valider la demande sécurisée sur votre téléphone. (MOOV ASSIST a ye lere mǒn wôé teke baa PIN wôé.)"
    },
    {
        "intent": "balance",
        "q": "Lere me mǒn wom.",
        "a": "Consultation de solde en cours. Une fenêtre sécurisée va s'ouvrir pour entrer votre PIN."
    },
    {
        "intent": "bill",
        "q": "Ma kômbô ya'a facture {bill_type}.",
        "a": "Ma ne wô vola ya'a facture {bill_type}. Ve me numéro de compteur ou de compte client."
    },
    {
        "intent": "recharge",
        "q": "Ma kômbô kuse crédit {amount} FCFA.",
        "a": "Achat de crédit de {amount} FCFA. Veuillez confirmer la transaction."
    },
    {
        "intent": "problem",
        "q": "Ma tebe nteban. Mǒn wom o nji kui be {name}.",
        "a": "Ma yene nteban wôé. Je vais vérifier la transaction vers {name}. Si besoin, je vous transfère au centre d'appel."
    },
    {
        "intent": "problem",
        "q": "Facture {bill_type} e nji ya'a.",
        "a": "Désolé pour le problème. Je vérifie le statut du paiement {bill_type}."
    }
]

# Modèles Omyènè
omyene_templates = [
    {
        "intent": "transfer",
        "q": "{greeting}, mi kômbô pèṉa {amount} FCFA na {name}.",
        "a": "Mbolo ! Mi pèṉa zene asu {amount} FCFA na {name}. O ne imvo'o ? (Veuillez confirmer l'envoi de {amount} FCFA à {name} avec votre code PIN.)"
    },
    {
        "intent": "transfer",
        "q": "Mi kômbô pèṉa mbongo. {amount} asu numéro {number}.",
        "a": "D'accord. Mi kômbô pèṉa {amount} FCFA asu {number}. Confirmez avec votre code secret."
    },
    {
        "intent": "balance",
        "q": "Jeṉô igomba yam nyi Moov Money.",
        "a": "Pour consulter votre solde, veuillez valider la demande sécurisée sur votre téléphone. (MOOV ASSIST a be lere igomba yaṉô teke pamba PIN.)"
    },
    {
        "intent": "balance",
        "q": "Mi kômbô jeṉô mbongo yam.",
        "a": "Consultation de solde en cours. Une fenêtre sécurisée va s'ouvrir pour entrer votre PIN."
    },
    {
        "intent": "bill",
        "q": "Mi kômbô yaṉa facture {bill_type}.",
        "a": "Mi ne wè pônga yaṉa facture {bill_type}. Ve me numéro de compteur ou de compte client."
    },
    {
        "intent": "recharge",
        "q": "Mi kômbô kuse crédit {amount} FCFA.",
        "a": "Achat de crédit de {amount} FCFA. Veuillez confirmer la transaction."
    },
    {
        "intent": "problem",
        "q": "Mi yene nteban. Mbongo yam a zele kui na {name}.",
        "a": "Mi yene nteban yaṉô. Je vais vérifier la transaction vers {name}. Si besoin, je vous transfère au centre d'appel."
    },
    {
        "intent": "problem",
        "q": "Facture {bill_type} a zele yaṉa.",
        "a": "Désolé pour le problème. Je vérifie le statut du paiement {bill_type}."
    }
]

def generate_data(templates, count):
    data = []
    for _ in range(count):
        t = random.choice(templates)
        q = t["q"].format(
            amount=random.choice(amounts),
            name=random.choice(names),
            number=random.choice(numbers),
            bill_type=random.choice(bill_types),
            greeting=random.choice(greetings)
        )
        a = t["a"].format(
            amount=random.choice(amounts),
            name=random.choice(names),
            number=random.choice(numbers),
            bill_type=random.choice(bill_types),
            greeting=random.choice(greetings)
        )
        data.append({"messages": [{"role": "user", "content": q}, {"role": "assistant", "content": a}]})
    return data

fang_data = generate_data(fang_templates, 200)
omyene_data = generate_data(omyene_templates, 200)

with open("rag_moov_assist_fang_200.jsonl", "w", encoding="utf-8") as f:
    for item in fang_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

with open("rag_moov_assist_omyene_200.jsonl", "w", encoding="utf-8") as f:
    for item in omyene_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")

print("Generated 200 pairs for Fang and 200 pairs for Omyene.")
