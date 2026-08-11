#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  ÑkyelGPT-2026 — Download Models & Datasets                              ║
║  SmartANDJ AI Technologies — Fondateur : Daniel Jonathan ANDJ              ║
║                                                                            ║
║  Pipeline de téléchargement pour ONYXGRIS fine-tuning QLoRA                ║
║  Langues cibles : Fang, Punu, Nzébi, Mpongwè + Français                   ║
║                                                                            ║
║  Usage :                                                                   ║
║    python scripts/download_models.py                                       ║
║    python scripts/download_models.py --token hf_XXXXXXXX                   ║
║    python scripts/download_models.py --skip-model --only-datasets          ║
║    python scripts/download_models.py --verify-only                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import argparse
import hashlib
import importlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional


# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

PROJECT_ROOT = Path(__file__).resolve().parent.parent

DOWNLOADS = {
    "model": {
        "repo_id": "McGill-NLP/AfriqueLlama-8B",
        "repo_type": "model",
        "local_dir": PROJECT_ROOT / "models" / "afrique-llama-8b",
        "description": "AfriqueLlama-8B — Modèle de base pour le fine-tuning ONYXGRIS",
    },
    "inkuba-instruct": {
        "repo_id": "lelapa/Inkuba-instruct",
        "repo_type": "dataset",
        "local_dir": PROJECT_ROOT / "data" / "inkuba-instruct",
        "description": "Inkuba-Instruct — Dataset d'instructions multilingues africaines",
    },
    "masakhaner": {
        "repo_id": "masakhane/masakhaner2",
        "repo_type": "dataset",
        "local_dir": PROJECT_ROOT / "data" / "masakhaner",
        "description": "MasakhaNER 2.0 — NER pour langues africaines",
    },
}

MANIFEST_PATH = PROJECT_ROOT / "models" / "models_manifest.json"

# ANSI colors for terminal output
class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


# ──────────────────────────────────────────────────────────────────────────────
# Utility functions
# ──────────────────────────────────────────────────────────────────────────────

def print_banner():
    """Affiche la bannière ÑkyelGPT."""
    banner = f"""
{Colors.CYAN}{Colors.BOLD}
    ╔═══════════════════════════════════════════════════════════════╗
    ║           🇬🇦  ÑkyelGPT-2026 — ONYXGRIS Pipeline  🇬🇦       ║
    ║                                                               ║
    ║   Téléchargement des modèles et datasets HuggingFace          ║
    ║   SmartANDJ AI Technologies — Daniel Jonathan ANDJ             ║
    ╚═══════════════════════════════════════════════════════════════╝
{Colors.RESET}"""
    print(banner)


def log_info(msg: str):
    print(f"  {Colors.GREEN}✓{Colors.RESET} {msg}")


def log_warn(msg: str):
    print(f"  {Colors.YELLOW}⚠{Colors.RESET} {msg}")


def log_error(msg: str):
    print(f"  {Colors.RED}✗{Colors.RESET} {msg}")


def log_step(step: int, total: int, msg: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}[{step}/{total}]{Colors.RESET} {Colors.BOLD}{msg}{Colors.RESET}")


def format_size(size_bytes: int) -> str:
    """Formate une taille en octets en unité lisible."""
    if size_bytes == 0:
        return "0 B"
    units = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    size = float(size_bytes)
    while size >= 1024.0 and i < len(units) - 1:
        size /= 1024.0
        i += 1
    return f"{size:.2f} {units[i]}"


def get_dir_size(path: Path) -> int:
    """Calcule la taille totale d'un répertoire récursivement."""
    total = 0
    if path.is_dir():
        for entry in path.rglob("*"):
            if entry.is_file():
                try:
                    total += entry.stat().st_size
                except OSError:
                    pass
    return total


def compute_md5(filepath: Path) -> str:
    """Calcule le hash MD5 d'un fichier."""
    md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            md5.update(chunk)
    return md5.hexdigest()


def compute_sha256(filepath: Path) -> str:
    """Calcule le hash SHA-256 d'un fichier."""
    sha = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha.update(chunk)
    return sha.hexdigest()


# ──────────────────────────────────────────────────────────────────────────────
# Step 1 — Vérifier et installer huggingface_hub
# ──────────────────────────────────────────────────────────────────────────────

def ensure_huggingface_hub():
    """Vérifie que huggingface_hub est installé, sinon l'installe."""
    log_step(1, 6, "Vérification de huggingface_hub")

    try:
        hf_hub = importlib.import_module("huggingface_hub")
        version = getattr(hf_hub, "__version__", "inconnue")
        log_info(f"huggingface_hub v{version} détecté")
        return hf_hub
    except ImportError:
        log_warn("huggingface_hub non trouvé — installation en cours...")

    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "--upgrade", "huggingface_hub[hf_transfer]"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        log_info("huggingface_hub installé avec succès")
    except subprocess.CalledProcessError as e:
        log_error(f"Impossible d'installer huggingface_hub : {e}")
        log_error("Essayez manuellement : pip install huggingface_hub[hf_transfer]")
        sys.exit(1)

    # Recharger le module après installation
    try:
        hf_hub = importlib.import_module("huggingface_hub")
        version = getattr(hf_hub, "__version__", "inconnue")
        log_info(f"huggingface_hub v{version} prêt")
        return hf_hub
    except ImportError:
        log_error("Échec critique : impossible de charger huggingface_hub après installation")
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────────────
# Step 2 — Téléchargement avec barre de progression
# ──────────────────────────────────────────────────────────────────────────────

class DownloadProgress:
    """Suivi de la progression globale des téléchargements."""

    def __init__(self):
        self.total_downloaded = 0
        self.download_times = {}
        self.errors = []
        self.successes = []

    def record_download(self, name: str, size_bytes: int, duration_secs: float):
        self.total_downloaded += size_bytes
        self.download_times[name] = {
            "size": size_bytes,
            "duration": duration_secs,
            "speed_mbps": (size_bytes / (1024 * 1024)) / max(duration_secs, 0.01),
        }
        self.successes.append(name)

    def record_error(self, name: str, error: str):
        self.errors.append({"name": name, "error": error})

    def print_summary(self):
        print(f"\n{Colors.BOLD}{'═' * 60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.CYAN}  📊  RÉSUMÉ DES TÉLÉCHARGEMENTS{Colors.RESET}")
        print(f"{Colors.BOLD}{'═' * 60}{Colors.RESET}\n")

        if self.successes:
            print(f"  {Colors.GREEN}Réussis :{Colors.RESET}")
            for name in self.successes:
                info = self.download_times[name]
                print(
                    f"    ✓ {name:<25} "
                    f"{format_size(info['size']):>10}  "
                    f"({info['duration']:.1f}s @ {info['speed_mbps']:.1f} MB/s)"
                )

        if self.errors:
            print(f"\n  {Colors.RED}Échoués :{Colors.RESET}")
            for err in self.errors:
                print(f"    ✗ {err['name']:<25} {err['error']}")

        print(f"\n  {Colors.BOLD}Total téléchargé : {format_size(self.total_downloaded)}{Colors.RESET}")
        print(f"{'═' * 60}\n")


def download_repo(
    hf_hub,
    key: str,
    config: dict,
    token: Optional[str],
    progress: DownloadProgress,
):
    """Télécharge un repo HuggingFace (modèle ou dataset)."""
    repo_id = config["repo_id"]
    repo_type = config["repo_type"]
    local_dir = config["local_dir"]
    description = config["description"]

    print(f"\n  {Colors.DIM}{'─' * 55}{Colors.RESET}")
    print(f"  {Colors.BOLD}📦 {description}{Colors.RESET}")
    print(f"  {Colors.DIM}   Repo : {repo_id}{Colors.RESET}")
    print(f"  {Colors.DIM}   Dest : {local_dir}{Colors.RESET}")

    # Créer le répertoire cible
    local_dir.mkdir(parents=True, exist_ok=True)

    start_time = time.time()

    try:
        # Activer hf_transfer si disponible pour des téléchargements plus rapides
        try:
            importlib.import_module("hf_transfer")
            os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
            log_info("hf_transfer activé (téléchargement accéléré)")
        except ImportError:
            pass

        # Téléchargement via snapshot_download (affiche sa propre barre de progression)
        from huggingface_hub import snapshot_download

        snapshot_download(
            repo_id=repo_id,
            repo_type=repo_type,
            local_dir=str(local_dir),
            token=token,
            resume_download=True,
            # tqdm affiche automatiquement la barre de progression
        )

        duration = time.time() - start_time
        size = get_dir_size(local_dir)
        progress.record_download(key, size, duration)

        log_info(f"Téléchargé : {format_size(size)} en {duration:.1f}s")

    except Exception as e:
        duration = time.time() - start_time
        error_msg = str(e)

        # Messages d'erreur contextuels
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            log_error(f"Erreur d'authentification pour {repo_id}")
            log_error("Utilisez --token hf_XXXXXXXX ou `huggingface-cli login`")
        elif "404" in error_msg:
            log_error(f"Repo introuvable : {repo_id}")
            log_error("Vérifiez le nom du repo sur huggingface.co")
        elif "disk" in error_msg.lower() or "space" in error_msg.lower():
            log_error(f"Espace disque insuffisant pour {repo_id}")
        else:
            log_error(f"Erreur lors du téléchargement de {repo_id} : {error_msg}")

        progress.record_error(key, error_msg[:100])


# ──────────────────────────────────────────────────────────────────────────────
# Step 3 — Vérification d'intégrité des fichiers safetensors
# ──────────────────────────────────────────────────────────────────────────────

def verify_safetensors(model_dir: Path) -> list[dict]:
    """
    Vérifie l'intégrité des fichiers .safetensors.

    Contrôles effectués :
    - Existence et taille non nulle
    - Magic bytes du format safetensors (header JSON length en little-endian)
    - Lecture complète du header JSON pour valider la structure
    - Hash SHA-256 pour le manifeste
    """
    log_step(4, 6, "Vérification d'intégrité des fichiers safetensors")

    safetensor_files = list(model_dir.rglob("*.safetensors"))

    if not safetensor_files:
        log_warn(f"Aucun fichier .safetensors trouvé dans {model_dir}")
        log_warn("Le modèle utilise peut-être le format PyTorch (.bin) ou GGUF")
        return []

    log_info(f"{len(safetensor_files)} fichier(s) safetensors trouvé(s)")
    verified_files = []
    errors = 0

    for sf in sorted(safetensor_files):
        relative_path = sf.relative_to(PROJECT_ROOT)
        file_size = sf.stat().st_size

        print(f"\n    {Colors.DIM}Vérification : {relative_path}{Colors.RESET}")

        # Contrôle 1 : Taille non nulle
        if file_size == 0:
            log_error(f"  Fichier vide : {relative_path}")
            errors += 1
            continue

        # Contrôle 2 : Header safetensors valide
        try:
            with open(sf, "rb") as f:
                # Les 8 premiers octets = taille du header JSON (uint64 little-endian)
                header_size_bytes = f.read(8)
                if len(header_size_bytes) < 8:
                    log_error(f"  Fichier tronqué : {relative_path}")
                    errors += 1
                    continue

                header_size = int.from_bytes(header_size_bytes, byteorder="little")

                # Sanity check : le header ne devrait pas faire plus de 100MB
                if header_size > 100 * 1024 * 1024:
                    log_error(f"  Header anormalement grand ({format_size(header_size)}) : {relative_path}")
                    errors += 1
                    continue

                # Contrôle 3 : Lire et parser le header JSON
                header_json = f.read(header_size)
                if len(header_json) < header_size:
                    log_error(f"  Header incomplet : {relative_path}")
                    errors += 1
                    continue

                header = json.loads(header_json)

                # Compter les tenseurs (exclure __metadata__)
                tensor_count = len([k for k in header.keys() if k != "__metadata__"])

        except json.JSONDecodeError:
            log_error(f"  Header JSON invalide : {relative_path}")
            errors += 1
            continue
        except Exception as e:
            log_error(f"  Erreur de lecture : {relative_path} — {e}")
            errors += 1
            continue

        # Contrôle 4 : Hash SHA-256
        print(f"    {Colors.DIM}  Calcul SHA-256...{Colors.RESET}", end="", flush=True)
        sha256 = compute_sha256(sf)
        md5 = compute_md5(sf)
        print(f"\r    {Colors.DIM}  SHA-256 : {sha256[:16]}...{Colors.RESET}")

        log_info(
            f"  ✓ {sf.name} — {format_size(file_size)} — "
            f"{tensor_count} tenseurs — intègre"
        )

        verified_files.append({
            "filename": sf.name,
            "relative_path": str(relative_path),
            "size_bytes": file_size,
            "size_human": format_size(file_size),
            "tensor_count": tensor_count,
            "sha256": sha256,
            "md5": md5,
            "verified": True,
        })

    # Résumé
    print()
    if errors == 0:
        log_info(f"Tous les fichiers safetensors sont intègres ({len(verified_files)}/{len(safetensor_files)})")
    else:
        log_error(f"{errors} fichier(s) safetensors corrompu(s) sur {len(safetensor_files)}")

    return verified_files


# ──────────────────────────────────────────────────────────────────────────────
# Step 4 — Génération du manifeste JSON
# ──────────────────────────────────────────────────────────────────────────────

def generate_manifest(verified_files: list[dict]):
    """Génère le fichier models_manifest.json avec métadonnées complètes."""
    log_step(5, 6, "Génération du manifeste models_manifest.json")

    now = datetime.now(timezone.utc).isoformat()

    # Collecter les infos sur tous les répertoires téléchargés
    assets = []
    for key, config in DOWNLOADS.items():
        local_dir = config["local_dir"]
        if local_dir.exists():
            dir_size = get_dir_size(local_dir)
            file_count = sum(1 for _ in local_dir.rglob("*") if _.is_file())

            asset = {
                "name": key,
                "repo_id": config["repo_id"],
                "repo_type": config["repo_type"],
                "local_path": str(local_dir.relative_to(PROJECT_ROOT)),
                "description": config["description"],
                "download_date": now,
                "total_size_bytes": dir_size,
                "total_size_human": format_size(dir_size),
                "file_count": file_count,
            }

            # Ajouter les hash des fichiers importants
            file_hashes = []
            important_extensions = {
                ".safetensors", ".bin", ".json", ".model",
                ".tokenizer", ".txt", ".parquet", ".arrow",
            }
            for f in sorted(local_dir.rglob("*")):
                if f.is_file() and f.suffix in important_extensions:
                    try:
                        file_hashes.append({
                            "file": str(f.relative_to(PROJECT_ROOT)),
                            "size_bytes": f.stat().st_size,
                            "md5": compute_md5(f),
                        })
                    except Exception:
                        pass

            asset["file_hashes"] = file_hashes
            assets.append(asset)

    manifest = {
        "_meta": {
            "project": "ÑkyelGPT-2026 / ONYXGRIS",
            "organization": "SmartANDJ AI Technologies",
            "founder": "Daniel Jonathan ANDJ",
            "generated_at": now,
            "generator": "scripts/download_models.py",
            "purpose": "Pipeline de fine-tuning QLoRA pour ONYXGRIS",
            "target_languages": ["Fang", "Punu", "Nzébi", "Mpongwè", "Français"],
        },
        "assets": assets,
        "safetensors_verification": verified_files,
    }

    # Écrire le manifeste
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    log_info(f"Manifeste écrit : {MANIFEST_PATH.relative_to(PROJECT_ROOT)}")
    log_info(f"  {len(assets)} asset(s) enregistré(s)")
    log_info(f"  {len(verified_files)} fichier(s) safetensors vérifiés")

    return manifest


# ──────────────────────────────────────────────────────────────────────────────
# Step 5 — Résumé final
# ──────────────────────────────────────────────────────────────────────────────

def print_final_summary(progress: DownloadProgress, manifest: dict):
    """Affiche le résumé final avec les prochaines étapes."""
    log_step(6, 6, "Résumé final")

    progress.print_summary()

    print(f"{Colors.CYAN}{Colors.BOLD}  🚀 PROCHAINES ÉTAPES :{Colors.RESET}\n")
    print(f"  1. Configurer RunPod A100 :")
    print(f"     {Colors.DIM}bash scripts/setup_runpod_finetune.sh{Colors.RESET}\n")
    print(f"  2. Lancer le fine-tuning QLoRA :")
    print(f"     {Colors.DIM}python scripts/train_qlora.py --config configs/onyxgris.yaml{Colors.RESET}\n")
    print(f"  3. Évaluer le modèle sur les langues gabonaises :")
    print(f"     {Colors.DIM}python scripts/evaluate.py --model ./models/onyxgris-v1{Colors.RESET}\n")


# ──────────────────────────────────────────────────────────────────────────────
# CLI Arguments
# ──────────────────────────────────────────────────────────────────────────────

def parse_args():
    parser = argparse.ArgumentParser(
        description="ÑkyelGPT-2026 — Téléchargement des modèles et datasets",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples :
  python scripts/download_models.py
  python scripts/download_models.py --token hf_XXXXXXXX
  python scripts/download_models.py --skip-model --only-datasets
  python scripts/download_models.py --verify-only
        """,
    )

    parser.add_argument(
        "--token",
        type=str,
        default=None,
        help="Token HuggingFace (pour les repos privés). "
             "Peut aussi être défini via HF_TOKEN ou HUGGING_FACE_HUB_TOKEN",
    )
    parser.add_argument(
        "--skip-model",
        action="store_true",
        help="Ne pas télécharger le modèle AfriqueLlama-8B",
    )
    parser.add_argument(
        "--only-datasets",
        action="store_true",
        help="Télécharger uniquement les datasets (pas le modèle)",
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Vérifier uniquement l'intégrité des fichiers existants (pas de téléchargement)",
    )
    parser.add_argument(
        "--no-verify",
        action="store_true",
        help="Désactiver la vérification d'intégrité après téléchargement",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Forcer le re-téléchargement même si les fichiers existent",
    )

    return parser.parse_args()


# ──────────────────────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────────────────────

def main():
    args = parse_args()

    print_banner()

    # ── Résoudre le token HF ──
    token = args.token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if token:
        log_info(f"Token HuggingFace détecté (***{token[-4:]})")
    else:
        log_warn("Pas de token HF — seuls les repos publics seront accessibles")
        log_warn("Définir via : --token, HF_TOKEN, ou `huggingface-cli login`")

    # ── Mode vérification uniquement ──
    if args.verify_only:
        model_dir = DOWNLOADS["model"]["local_dir"]
        if not model_dir.exists():
            log_error(f"Répertoire modèle introuvable : {model_dir}")
            sys.exit(1)
        verified = verify_safetensors(model_dir)
        generate_manifest(verified)
        log_info("Vérification terminée.")
        return

    # ── Étape 1 : Installer huggingface_hub ──
    hf_hub = ensure_huggingface_hub()

    # ── Étape 2 : Déterminer les downloads ──
    log_step(2, 6, "Préparation des téléchargements")

    downloads_to_run = {}
    skip_model = args.skip_model or args.only_datasets

    for key, config in DOWNLOADS.items():
        if skip_model and config["repo_type"] == "model":
            log_warn(f"Modèle ignoré (--skip-model) : {config['repo_id']}")
            continue

        if not args.force and config["local_dir"].exists():
            existing_size = get_dir_size(config["local_dir"])
            if existing_size > 0:
                log_info(
                    f"Déjà présent : {config['repo_id']} "
                    f"({format_size(existing_size)}) — resume_download=True"
                )

        downloads_to_run[key] = config

    if not downloads_to_run:
        log_warn("Aucun téléchargement à effectuer")
        return

    log_info(f"{len(downloads_to_run)} téléchargement(s) planifié(s)")

    # ── Étape 3 : Téléchargement ──
    log_step(3, 6, "Téléchargement depuis HuggingFace Hub")

    progress = DownloadProgress()

    for key, config in downloads_to_run.items():
        download_repo(hf_hub, key, config, token, progress)

    # ── Étape 4 : Vérification safetensors ──
    verified_files = []
    if not args.no_verify:
        model_dir = DOWNLOADS["model"]["local_dir"]
        if model_dir.exists():
            verified_files = verify_safetensors(model_dir)
        else:
            log_warn("Répertoire modèle absent — vérification safetensors ignorée")
    else:
        log_warn("Vérification safetensors désactivée (--no-verify)")

    # ── Étape 5 : Génération du manifeste ──
    manifest = generate_manifest(verified_files)

    # ── Étape 6 : Résumé ──
    print_final_summary(progress, manifest)

    # Exit code basé sur les erreurs
    if progress.errors:
        log_error(f"{len(progress.errors)} erreur(s) durant le téléchargement")
        sys.exit(1)
    else:
        log_info("Tous les téléchargements terminés avec succès ! 🎉")


if __name__ == "__main__":
    main()
