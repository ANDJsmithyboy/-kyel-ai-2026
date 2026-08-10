#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  GabomaGPT-2026 — RunPod A100 80Go Setup Script                           ║
# ║  SmartANDJ AI Technologies — Fondateur : Daniel Jonathan ANDJ              ║
# ║                                                                            ║
# ║  Pipeline de fine-tuning QLoRA pour ONYXGRIS                               ║
# ║  Langues cibles : Fang, Punu, Nzébi, Mpongwè + Français                   ║
# ║                                                                            ║
# ║  Usage :                                                                   ║
# ║    bash scripts/setup_runpod_finetune.sh                                   ║
# ║    GITHUB_TOKEN=ghp_xxx HF_TOKEN=hf_xxx bash scripts/setup_runpod_finetune.sh ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -euo pipefail
IFS=$'\n\t'

# ──────────────────────────────────────────────────────────────────────────────
# ANSI Colors
# ──────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# ──────────────────────────────────────────────────────────────────────────────
# Configuration — Variables d'environnement
# ──────────────────────────────────────────────────────────────────────────────

# === Projet ===
export PROJECT_NAME="GabomaGPT-2026"
export MODEL_NAME="ONYXGRIS"
export ORG_NAME="SmartANDJ AI Technologies"
export FOUNDER="Daniel Jonathan ANDJ"

# === Chemins ===
export WORKSPACE_DIR="${WORKSPACE_DIR:-/workspace}"
export PROJECT_DIR="${WORKSPACE_DIR}/${PROJECT_NAME}"
export MODELS_DIR="${PROJECT_DIR}/models"
export DATA_DIR="${PROJECT_DIR}/data"
export OUTPUT_DIR="${PROJECT_DIR}/outputs"
export LOGS_DIR="${PROJECT_DIR}/logs"
export CACHE_DIR="${WORKSPACE_DIR}/.cache"

# === HuggingFace ===
export HF_TOKEN="${HF_TOKEN:-}"
export HF_HOME="${CACHE_DIR}/huggingface"
export HF_HUB_CACHE="${HF_HOME}/hub"
export TRANSFORMERS_CACHE="${HF_HOME}/transformers"
export HF_DATASETS_CACHE="${HF_HOME}/datasets"

# === GitHub ===
export GITHUB_REPO_URL="${GITHUB_REPO_URL:-https://github.com/SmartANDJ/GabomaGPT-2026.git}"
export GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# === CUDA / GPU ===
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"
export PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True"
export CUDA_LAUNCH_BLOCKING="${CUDA_LAUNCH_BLOCKING:-0}"
export NCCL_P2P_DISABLE="${NCCL_P2P_DISABLE:-0}"

# === Training ===
export WANDB_PROJECT="${WANDB_PROJECT:-gabomagpt-onyxgris}"
export WANDB_API_KEY="${WANDB_API_KEY:-}"
export WANDB_MODE="${WANDB_MODE:-online}"

# === Performance ===
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-8}"
export TOKENIZERS_PARALLELISM="true"
export HF_HUB_ENABLE_HF_TRANSFER="1"

# === Python ===
export PYTHON_VERSION="3.11"
export PIP_NO_CACHE_DIR="${PIP_NO_CACHE_DIR:-0}"

# ──────────────────────────────────────────────────────────────────────────────
# Fonctions utilitaires
# ──────────────────────────────────────────────────────────────────────────────

print_banner() {
    echo -e "${CYAN}${BOLD}"
    echo "    ╔═══════════════════════════════════════════════════════════════╗"
    echo "    ║          🇬🇦  GabomaGPT-2026 — RunPod A100 Setup  🇬🇦        ║"
    echo "    ║                                                               ║"
    echo "    ║   Fine-tuning QLoRA pour ONYXGRIS                             ║"
    echo "    ║   SmartANDJ AI Technologies — Daniel Jonathan ANDJ            ║"
    echo "    ╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${RESET}"
}

log_step() {
    local step="$1"
    local total="$2"
    local msg="$3"
    echo -e "\n${BOLD}${BLUE}[${step}/${total}]${RESET} ${BOLD}${msg}${RESET}"
}

log_info() {
    echo -e "  ${GREEN}✓${RESET} $1"
}

log_warn() {
    echo -e "  ${YELLOW}⚠${RESET} $1"
}

log_error() {
    echo -e "  ${RED}✗${RESET} $1"
}

log_detail() {
    echo -e "  ${DIM}  $1${RESET}"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_info "$1 trouvé : $(command -v "$1")"
        return 0
    else
        log_warn "$1 non trouvé"
        return 1
    fi
}

format_bytes() {
    local bytes=$1
    if (( bytes >= 1073741824 )); then
        echo "$(echo "scale=2; $bytes / 1073741824" | bc) GB"
    elif (( bytes >= 1048576 )); then
        echo "$(echo "scale=2; $bytes / 1048576" | bc) MB"
    else
        echo "${bytes} B"
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1 — Vérification du GPU
# ──────────────────────────────────────────────────────────────────────────────

check_gpu() {
    log_step 1 7 "Vérification du GPU NVIDIA"

    # Vérifier nvidia-smi
    if ! command -v nvidia-smi &> /dev/null; then
        log_error "nvidia-smi non trouvé — pas de GPU NVIDIA détecté"
        log_error "Ce script nécessite un GPU NVIDIA A100 80Go (RunPod)"
        exit 1
    fi

    # Capturer les infos GPU
    GPU_NAME=$(nvidia-smi --query-gpu=name --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_VRAM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_DRIVER=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_CUDA_VERSION=$(nvidia-smi 2>/dev/null | grep "CUDA Version" | awk '{print $NF}' | tr -d ' ')
    GPU_COUNT=$(nvidia-smi --query-gpu=count --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_TEMP=$(nvidia-smi --query-gpu=temperature.gpu --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_POWER=$(nvidia-smi --query-gpu=power.draw --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)
    GPU_VRAM_FREE_MB=$(nvidia-smi --query-gpu=memory.free --format=csv,noheader,nounits 2>/dev/null | head -n1 | xargs)

    log_info "GPU détecté : ${GPU_NAME}"
    log_detail "VRAM totale  : ${GPU_VRAM_MB} MB ($(echo "scale=1; ${GPU_VRAM_MB} / 1024" | bc) GB)"
    log_detail "VRAM libre   : ${GPU_VRAM_FREE_MB} MB"
    log_detail "Driver       : ${GPU_DRIVER}"
    log_detail "CUDA         : ${GPU_CUDA_VERSION}"
    log_detail "GPU Count    : ${GPU_COUNT}"
    log_detail "Température  : ${GPU_TEMP}°C"
    log_detail "Puissance    : ${GPU_POWER} W"

    # Vérifier que c'est bien un A100 ou un GPU compatible
    if [[ "${GPU_NAME}" == *"A100"* ]]; then
        log_info "GPU A100 confirmé — configuration optimale pour QLoRA 🎯"
    elif [[ "${GPU_NAME}" == *"H100"* ]]; then
        log_info "GPU H100 détecté — supérieur à A100, excellent ! 🚀"
    elif [[ "${GPU_NAME}" == *"A6000"* ]] || [[ "${GPU_NAME}" == *"4090"* ]]; then
        log_warn "GPU ${GPU_NAME} détecté — compatible mais non optimal"
        log_warn "Recommandé : A100 80Go pour le fine-tuning complet d'un 8B"
    else
        log_warn "GPU ${GPU_NAME} — vérifiez la compatibilité avec QLoRA 4-bit"
    fi

    # Vérifier la VRAM minimale (40Go minimum pour un modèle 8B en 4-bit)
    if (( GPU_VRAM_MB < 40000 )); then
        log_warn "VRAM (${GPU_VRAM_MB} MB) potentiellement insuffisante pour un 8B"
        log_warn "Minimum recommandé : 40 Go (A100 40Go) — Optimal : 80 Go (A100 80Go)"
    else
        log_info "VRAM suffisante pour QLoRA 4-bit sur un modèle 8B"
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2 — Configuration des répertoires et stockage réseau
# ──────────────────────────────────────────────────────────────────────────────

setup_directories() {
    log_step 2 7 "Configuration des répertoires de travail"

    # Vérifier le workspace RunPod
    if [[ -d "${WORKSPACE_DIR}" ]]; then
        log_info "Workspace RunPod détecté : ${WORKSPACE_DIR}"

        # Vérifier si c'est un network storage monté
        if mountpoint -q "${WORKSPACE_DIR}" 2>/dev/null; then
            log_info "Network storage RunPod monté ✓"
            WORKSPACE_DISK_TOTAL=$(df -BG "${WORKSPACE_DIR}" | tail -1 | awk '{print $2}')
            WORKSPACE_DISK_AVAIL=$(df -BG "${WORKSPACE_DIR}" | tail -1 | awk '{print $4}')
            log_detail "Espace total     : ${WORKSPACE_DISK_TOTAL}"
            log_detail "Espace disponible: ${WORKSPACE_DISK_AVAIL}"
        else
            log_info "Workspace local (pas de network storage)"
            WORKSPACE_DISK_AVAIL=$(df -BG "${WORKSPACE_DIR}" | tail -1 | awk '{print $4}')
            log_detail "Espace disponible : ${WORKSPACE_DISK_AVAIL}"
        fi
    else
        log_warn "Workspace RunPod absent — utilisation du répertoire courant"
        export WORKSPACE_DIR="$(pwd)"
        export PROJECT_DIR="${WORKSPACE_DIR}"
    fi

    # Créer l'arborescence
    local dirs=(
        "${PROJECT_DIR}"
        "${MODELS_DIR}"
        "${MODELS_DIR}/afrique-llama-8b"
        "${DATA_DIR}"
        "${DATA_DIR}/inkuba-instruct"
        "${DATA_DIR}/masakhaner"
        "${DATA_DIR}/gabonais"
        "${OUTPUT_DIR}"
        "${OUTPUT_DIR}/onyxgris-v1"
        "${OUTPUT_DIR}/checkpoints"
        "${LOGS_DIR}"
        "${CACHE_DIR}"
        "${HF_HOME}"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "${dir}"
    done

    log_info "Arborescence créée :"
    log_detail "${PROJECT_DIR}/"
    log_detail "├── models/"
    log_detail "│   └── afrique-llama-8b/"
    log_detail "├── data/"
    log_detail "│   ├── inkuba-instruct/"
    log_detail "│   ├── masakhaner/"
    log_detail "│   └── gabonais/"
    log_detail "├── outputs/"
    log_detail "│   ├── onyxgris-v1/"
    log_detail "│   └── checkpoints/"
    log_detail "└── logs/"
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 3 — Installation des dépendances Python
# ──────────────────────────────────────────────────────────────────────────────

install_dependencies() {
    log_step 3 7 "Installation des dépendances Python"

    # Vérifier Python
    if ! check_command python3; then
        log_error "Python 3 requis mais non trouvé"
        exit 1
    fi

    PYTHON_CURRENT=$(python3 --version 2>&1 | awk '{print $2}')
    log_info "Python ${PYTHON_CURRENT}"

    # Vérifier pip
    if ! check_command pip3; then
        log_warn "pip3 non trouvé, tentative d'installation..."
        python3 -m ensurepip --upgrade 2>/dev/null || {
            log_error "Impossible d'installer pip"
            exit 1
        }
    fi

    # Mise à jour de pip
    log_info "Mise à jour de pip..."
    pip3 install --upgrade pip setuptools wheel --quiet

    # ── Installer PyTorch avec CUDA ──
    echo -e "\n  ${DIM}── Installation de PyTorch avec CUDA ──${RESET}"

    # Détecter la version CUDA pour choisir le bon index PyTorch
    CUDA_MAJOR_MINOR=""
    if command -v nvcc &> /dev/null; then
        CUDA_MAJOR_MINOR=$(nvcc --version 2>/dev/null | grep "release" | sed 's/.*release //' | sed 's/,.*//' | tr -d '.')
    elif [[ -n "${GPU_CUDA_VERSION:-}" ]]; then
        CUDA_MAJOR_MINOR=$(echo "${GPU_CUDA_VERSION}" | tr -d '.')
    fi

    # Choisir l'index PyTorch en fonction de CUDA
    TORCH_INDEX=""
    if [[ "${CUDA_MAJOR_MINOR}" == "124" ]] || [[ "${CUDA_MAJOR_MINOR}" == "1240" ]]; then
        TORCH_INDEX="https://download.pytorch.org/whl/cu124"
        log_info "Index PyTorch : CUDA 12.4"
    elif [[ "${CUDA_MAJOR_MINOR}" == "121" ]] || [[ "${CUDA_MAJOR_MINOR}" == "1210" ]]; then
        TORCH_INDEX="https://download.pytorch.org/whl/cu121"
        log_info "Index PyTorch : CUDA 12.1"
    elif [[ "${CUDA_MAJOR_MINOR}" == "118" ]] || [[ "${CUDA_MAJOR_MINOR}" == "1180" ]]; then
        TORCH_INDEX="https://download.pytorch.org/whl/cu118"
        log_info "Index PyTorch : CUDA 11.8"
    else
        log_warn "Version CUDA non standard (${CUDA_MAJOR_MINOR}) — installation par défaut"
        TORCH_INDEX="https://download.pytorch.org/whl/cu124"
    fi

    pip3 install torch torchvision torchaudio --index-url "${TORCH_INDEX}" --quiet 2>&1 | tail -1 || true
    log_info "PyTorch installé"

    # ── Installer les bibliothèques de fine-tuning ──
    echo -e "\n  ${DIM}── Installation des bibliothèques ML / fine-tuning ──${RESET}"

    # Core transformers stack
    pip3 install --upgrade \
        "transformers>=4.45.0" \
        "tokenizers>=0.20.0" \
        "accelerate>=1.0.0" \
        "datasets>=3.0.0" \
        "huggingface_hub[hf_transfer]>=0.26.0" \
        --quiet 2>&1 | tail -1 || true
    log_info "Transformers stack installé"

    # PEFT / QLoRA
    pip3 install --upgrade \
        "peft>=0.13.0" \
        "bitsandbytes>=0.44.0" \
        "trl>=0.12.0" \
        --quiet 2>&1 | tail -1 || true
    log_info "PEFT + bitsandbytes + TRL installés"

    # Unsloth (optimisations pour fine-tuning rapide)
    echo -e "\n  ${DIM}── Installation d'Unsloth (optimisations GPU) ──${RESET}"
    pip3 install --upgrade "unsloth[cu124-torch250]" --quiet 2>&1 | tail -1 || {
        log_warn "Installation Unsloth optimisée échouée, tentative fallback..."
        pip3 install --upgrade unsloth --quiet 2>&1 | tail -1 || {
            log_warn "Unsloth non installé — fine-tuning fonctionnera sans optimisations Unsloth"
        }
    }
    log_info "Unsloth installé (ou fallback)"

    # Monitoring et logging
    pip3 install --upgrade \
        wandb \
        tensorboard \
        --quiet 2>&1 | tail -1 || true
    log_info "WandB + TensorBoard installés"

    # Utilitaires
    pip3 install --upgrade \
        safetensors \
        sentencepiece \
        protobuf \
        scipy \
        scikit-learn \
        evaluate \
        seqeval \
        rouge-score \
        einops \
        flash-attn \
        --quiet 2>&1 | tail -2 || {
            log_warn "Certains utilitaires optionnels n'ont pas pu être installés"
            # flash-attn peut échouer sur certaines configurations
            pip3 install --upgrade \
                safetensors sentencepiece protobuf scipy scikit-learn \
                evaluate seqeval rouge-score einops \
                --quiet 2>&1 | tail -1 || true
        }
    log_info "Utilitaires ML installés"
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 4 — Vérification PyTorch + CUDA
# ──────────────────────────────────────────────────────────────────────────────

verify_torch_cuda() {
    log_step 4 7 "Vérification de PyTorch + CUDA"

    python3 << 'PYEOF'
import sys
import torch

print(f"  PyTorch version   : {torch.__version__}")
print(f"  CUDA disponible   : {torch.cuda.is_available()}")

if not torch.cuda.is_available():
    print("  ✗ CUDA NON DISPONIBLE — le fine-tuning GPU ne fonctionnera pas")
    sys.exit(1)

print(f"  CUDA version      : {torch.version.cuda}")
print(f"  cuDNN version     : {torch.backends.cudnn.version()}")
print(f"  Nombre de GPU     : {torch.cuda.device_count()}")

for i in range(torch.cuda.device_count()):
    props = torch.cuda.get_device_properties(i)
    vram_gb = props.total_mem / (1024**3)
    print(f"  GPU {i}             : {props.name}")
    print(f"    VRAM            : {vram_gb:.1f} GB")
    print(f"    Compute Cap.    : {props.major}.{props.minor}")
    print(f"    Multi-Processor : {props.multi_processor_count}")

# Test rapide d'allocation GPU
try:
    x = torch.randn(1024, 1024, device="cuda")
    y = torch.matmul(x, x)
    del x, y
    torch.cuda.empty_cache()
    print("  ✓ Test d'allocation GPU réussi")
except Exception as e:
    print(f"  ✗ Test GPU échoué : {e}")
    sys.exit(1)

# Vérifier bitsandbytes
try:
    import bitsandbytes as bnb
    print(f"  bitsandbytes      : {bnb.__version__}")
    # Test rapide de quantification
    linear = bnb.nn.Linear4bit(64, 64, bias=False, quant_type="nf4")
    print("  ✓ bitsandbytes 4-bit fonctionnel")
except ImportError:
    print("  ⚠ bitsandbytes non importable")
except Exception as e:
    print(f"  ⚠ bitsandbytes test: {e}")

# Vérifier les versions critiques
packages = {
    "transformers": "transformers",
    "peft": "peft",
    "trl": "trl",
    "datasets": "datasets",
    "accelerate": "accelerate",
    "huggingface_hub": "huggingface_hub",
    "safetensors": "safetensors",
    "wandb": "wandb",
}

print("\n  Versions des packages :")
for display_name, import_name in packages.items():
    try:
        mod = __import__(import_name)
        ver = getattr(mod, "__version__", "?")
        print(f"    {display_name:<20} : {ver}")
    except ImportError:
        print(f"    {display_name:<20} : NON INSTALLÉ")

# Vérifier unsloth séparément (peut ne pas être installé)
try:
    import unsloth
    print(f"    {'unsloth':<20} : {getattr(unsloth, '__version__', 'installé')}")
except ImportError:
    print(f"    {'unsloth':<20} : NON INSTALLÉ (optionnel)")
PYEOF

    if [[ $? -eq 0 ]]; then
        log_info "PyTorch + CUDA vérifiés avec succès"
    else
        log_error "Problème détecté avec PyTorch/CUDA"
        exit 1
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 5 — Cloner le repo GabomaGPT
# ──────────────────────────────────────────────────────────────────────────────

clone_repo() {
    log_step 5 7 "Clonage du repository GabomaGPT"

    # Si le projet existe déjà, pull les dernières modifications
    if [[ -d "${PROJECT_DIR}/.git" ]]; then
        log_info "Repository existant détecté — git pull"
        cd "${PROJECT_DIR}"
        git pull --rebase 2>&1 | head -5 || {
            log_warn "git pull échoué — le code local sera utilisé tel quel"
        }
        cd -  > /dev/null
        return
    fi

    # Construire l'URL avec token si disponible
    CLONE_URL="${GITHUB_REPO_URL}"
    if [[ -n "${GITHUB_TOKEN}" ]]; then
        # Injecter le token dans l'URL HTTPS
        CLONE_URL=$(echo "${GITHUB_REPO_URL}" | sed "s|https://|https://${GITHUB_TOKEN}@|")
        log_info "Token GitHub détecté — authentification activée"
    fi

    log_info "Clonage depuis : ${GITHUB_REPO_URL}"
    log_detail "(Token masqué pour la sécurité)"

    git clone --depth 1 "${CLONE_URL}" "${PROJECT_DIR}" 2>&1 || {
        log_warn "Clonage échoué — le projet sera configuré manuellement"
        log_warn "URL : ${GITHUB_REPO_URL}"
        log_warn "Vérifiez l'accès au repo et le token GitHub"
        mkdir -p "${PROJECT_DIR}"
    }

    log_info "Repository configuré dans ${PROJECT_DIR}"
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 6 — Configuration WandB
# ──────────────────────────────────────────────────────────────────────────────

setup_wandb() {
    log_step 6 7 "Configuration de Weights & Biases (WandB)"

    if [[ -n "${WANDB_API_KEY}" ]]; then
        log_info "Clé API WandB détectée"
        python3 -c "import wandb; wandb.login(key='${WANDB_API_KEY}')" 2>/dev/null && {
            log_info "WandB authentifié — projet : ${WANDB_PROJECT}"
        } || {
            log_warn "Authentification WandB échouée"
        }
    else
        log_warn "Pas de clé API WandB (WANDB_API_KEY)"
        log_warn "Le logging WandB sera désactivé — utilisation de tensorboard"
        export WANDB_MODE="disabled"
    fi
}

# ──────────────────────────────────────────────────────────────────────────────
# ÉTAPE 7 — Résumé de configuration
# ──────────────────────────────────────────────────────────────────────────────

print_summary() {
    log_step 7 7 "Résumé de la configuration"

    # Recalculer les valeurs
    local gpu_name="${GPU_NAME:-Non détecté}"
    local gpu_vram="${GPU_VRAM_MB:-0}"
    local gpu_vram_gb
    gpu_vram_gb=$(echo "scale=1; ${gpu_vram} / 1024" | bc 2>/dev/null || echo "?")
    local disk_avail
    disk_avail=$(df -BG "${WORKSPACE_DIR}" 2>/dev/null | tail -1 | awk '{print $4}' || echo "?")
    local disk_total
    disk_total=$(df -BG "${WORKSPACE_DIR}" 2>/dev/null | tail -1 | awk '{print $2}' || echo "?")
    local ram_total
    ram_total=$(free -g 2>/dev/null | awk '/Mem:/{print $2}' || echo "?")
    local ram_avail
    ram_avail=$(free -g 2>/dev/null | awk '/Mem:/{print $7}' || echo "?")
    local cpu_cores
    cpu_cores=$(nproc 2>/dev/null || echo "?")
    local py_version
    py_version=$(python3 --version 2>&1 | awk '{print $2}')

    echo -e "\n${CYAN}${BOLD}"
    echo "    ╔═══════════════════════════════════════════════════════════════╗"
    echo "    ║              📋  RÉSUMÉ DE CONFIGURATION                     ║"
    echo "    ╠═══════════════════════════════════════════════════════════════╣"
    echo -e "    ║  ${RESET}${BOLD}Projet        : ${PROJECT_NAME} / ${MODEL_NAME}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}${BOLD}Organisation  : ${ORG_NAME}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}${BOLD}Fondateur     : ${FOUNDER}${CYAN}${BOLD}"
    echo "    ╠═══════════════════════════════════════════════════════════════╣"
    echo -e "    ║  ${RESET}${GREEN}GPU           : ${gpu_name}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}${GREEN}VRAM          : ${gpu_vram_gb} GB${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}${GREEN}CUDA          : ${GPU_CUDA_VERSION:-?}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}${GREEN}Driver        : ${GPU_DRIVER:-?}${CYAN}${BOLD}"
    echo "    ╠═══════════════════════════════════════════════════════════════╣"
    echo -e "    ║  ${RESET}CPU Cores     : ${cpu_cores}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}RAM totale    : ${ram_total} GB${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}RAM disponible: ${ram_avail} GB${CYAN}${BOLD}"
    echo "    ╠═══════════════════════════════════════════════════════════════╣"
    echo -e "    ║  ${RESET}Disque total  : ${disk_total}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}Disque dispo  : ${disk_avail}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}Workspace     : ${WORKSPACE_DIR}${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}Python        : ${py_version}${CYAN}${BOLD}"
    echo "    ╠═══════════════════════════════════════════════════════════════╣"
    echo -e "    ║  ${RESET}HF Token      : $(if [[ -n "${HF_TOKEN}" ]]; then echo "✓ Configuré"; else echo "✗ Non défini"; fi)${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}WandB         : $(if [[ "${WANDB_MODE}" != "disabled" ]]; then echo "✓ Activé"; else echo "○ Désactivé"; fi)${CYAN}${BOLD}"
    echo -e "    ║  ${RESET}GitHub Token  : $(if [[ -n "${GITHUB_TOKEN}" ]]; then echo "✓ Configuré"; else echo "○ Non défini"; fi)${CYAN}${BOLD}"
    echo -e "    ${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════════╝${RESET}"

    echo -e "\n${GREEN}${BOLD}  🚀 PROCHAINES ÉTAPES :${RESET}\n"
    echo "  1. Télécharger le modèle et les datasets :"
    echo -e "     ${DIM}python3 scripts/download_models.py --token \$HF_TOKEN${RESET}\n"
    echo "  2. Lancer le fine-tuning QLoRA ONYXGRIS :"
    echo -e "     ${DIM}python3 scripts/train_qlora.py --config configs/onyxgris.yaml${RESET}\n"
    echo "  3. Évaluer le modèle sur les langues gabonaises :"
    echo -e "     ${DIM}python3 scripts/evaluate.py --model outputs/onyxgris-v1${RESET}\n"
    echo -e "  ${DIM}Logs : ${LOGS_DIR}${RESET}"
    echo -e "  ${DIM}Date : $(date -Iseconds)${RESET}\n"

    # Écrire la configuration dans un fichier de log
    {
        echo "# GabomaGPT-2026 RunPod Configuration"
        echo "# Generated: $(date -Iseconds)"
        echo ""
        echo "GPU_NAME=${gpu_name}"
        echo "GPU_VRAM_GB=${gpu_vram_gb}"
        echo "CUDA_VERSION=${GPU_CUDA_VERSION:-unknown}"
        echo "DRIVER_VERSION=${GPU_DRIVER:-unknown}"
        echo "CPU_CORES=${cpu_cores}"
        echo "RAM_TOTAL_GB=${ram_total}"
        echo "DISK_AVAILABLE=${disk_avail}"
        echo "WORKSPACE=${WORKSPACE_DIR}"
        echo "PYTHON_VERSION=${py_version}"
        echo "HF_TOKEN_SET=$(if [[ -n "${HF_TOKEN}" ]]; then echo "true"; else echo "false"; fi)"
        echo "WANDB_MODE=${WANDB_MODE}"
    } > "${LOGS_DIR}/runpod_config_$(date +%Y%m%d_%H%M%S).log"

    log_info "Configuration sauvegardée dans ${LOGS_DIR}/"
}

# ──────────────────────────────────────────────────────────────────────────────
# Exécution principale
# ──────────────────────────────────────────────────────────────────────────────

main() {
    local start_time=$SECONDS

    print_banner

    check_gpu
    setup_directories
    install_dependencies
    verify_torch_cuda
    clone_repo
    setup_wandb
    print_summary

    local elapsed=$(( SECONDS - start_time ))
    local minutes=$(( elapsed / 60 ))
    local seconds=$(( elapsed % 60 ))

    echo -e "${GREEN}${BOLD}  ✅ Setup terminé en ${minutes}m${seconds}s${RESET}\n"
}

# Lancer
main "$@"
