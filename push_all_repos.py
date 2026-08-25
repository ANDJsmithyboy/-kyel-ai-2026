r"""
Ñkyel AI — Script de synchronisation et push séparé (Frontend & Backend)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ

1. Pousse le Frontend réel (f:\Nkyel-AI-2026\nkyel-fd-main) vers https://github.com/ANDJsmithyboy/nkyel-fd.git
2. Pousse le Backend & Workspace racine (f:\Nkyel-AI-2026) vers https://github.com/ANDJsmithyboy/-kyel-ai-2026.git
"""

import os
import shutil
import stat
import subprocess
import sys


def log(msg: str):
    try:
        print(msg, flush=True)
    except Exception:
        print(msg.encode("ascii", "replace").decode("ascii"), flush=True)


def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)


def push_frontend():
    log("\n" + "=" * 60)
    log("[*] 1/2 -- PUSH FRONTEND (nkyel-fd-main -> nkyel-fd / Vercel)")
    log("=" * 60)

    root_dir = r"f:\Nkyel-AI-2026"
    src_dir = os.path.join(root_dir, "nkyel-fd-main")
    temp_dir = os.path.join(root_dir, ".temp_sync_fd")
    target_repo = "https://github.com/ANDJsmithyboy/nkyel-fd.git"

    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir, onerror=remove_readonly)

    log("[*] Clonage de nkyel-fd...")
    res = subprocess.run(["git", "clone", "--depth", "1", target_repo, temp_dir], capture_output=True, text=True)
    if res.returncode != 0:
        log(f"[-] Erreur clonage frontend : {res.stderr}")
        return False

    log(f"[*] Copie des fichiers de {src_dir} vers {temp_dir}...")
    ignored = {".git", "node_modules", ".next", ".turbo", "tsconfig.tsbuildinfo", ".temp_sync_fd"}

    # Nettoyer l'ancien contenu du repo distant (sauf .git)
    for item in os.listdir(temp_dir):
        if item == ".git":
            continue
        p = os.path.join(temp_dir, item)
        if os.path.isdir(p):
            shutil.rmtree(p, onerror=remove_readonly)
        else:
            try:
                os.remove(p)
            except Exception:
                pass

    # Copier les fichiers du vrai frontend
    for item in os.listdir(src_dir):
        if item in ignored:
            continue
        s = os.path.join(src_dir, item)
        d = os.path.join(temp_dir, item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)

    subprocess.run(["git", "config", "core.autocrlf", "true"], cwd=temp_dir)
    subprocess.run(["git", "add", "-A"], cwd=temp_dir, check=True)

    status = subprocess.run(["git", "status", "--porcelain"], cwd=temp_dir, capture_output=True, text=True)
    if status.stdout.strip():
        commit_msg = (
            "feat(frontend): Manus × Apple Navigation & Popover, Tavily-style Auth Card on Replicate/Leonardo Wallpaper\n\n"
            "- Manus-Style Sidebar Navigation, Task Composer & Floating Glass Profile Popover\n"
            "- Google Profile Image / Avatar sync in Sidebar Footer and Popover\n"
            "- Tavily by Nebius Sign-In & Sign-Up Card on /brand/nkyel-ai-ios.png wallpaper\n"
            "- Canonical Iboga Navigation Signature (shared across Ñkyel AI and Gaboma AI)\n"
            "- Production Feedback Modal & 40-Hour Validation Cockpit\n\n"
            "SmartANDJ AI Technologies - Founder & Lead Architect: Daniel Jonathan ANDJ"
        )
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=temp_dir, check=True)
        log("[*] Push vers origin main de nkyel-fd...")
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=temp_dir, capture_output=True, text=True)
        if push_res.returncode == 0:
            log("[+] SUCCES : Frontend nkyel-fd (Vercel) pushe avec succes !")
        else:
            log(f"[-] Erreur push frontend : {push_res.stderr}")
            return False
    else:
        log("[i] Le depot frontend nkyel-fd est deja a jour.")

    # Nettoyage
    try:
        shutil.rmtree(temp_dir, onerror=remove_readonly)
    except Exception:
        pass

    return True


def push_backend():
    log("\n" + "=" * 60)
    log("[*] 2/2 -- PUSH BACKEND & WORKSPACE (-kyel-ai-2026)")
    log("=" * 60)

    root_dir = r"f:\Nkyel-AI-2026"

    log("[*] Git add dans le depot principal...")
    subprocess.run(["git", "add", "-A"], cwd=root_dir, check=True)

    status = subprocess.run(["git", "status", "--porcelain"], cwd=root_dir, capture_output=True, text=True)
    if status.stdout.strip():
        commit_msg = (
            "feat(platform): Manus × Apple UI, Tavily Auth Card, 40-Hour Validation Cockpit & Product Scope Freeze\n\n"
            "- Manus Sidebar Navigation, Google Profile Image Sync & Floating Profile Popover\n"
            "- Tavily by Nebius Auth Shell & Replicate/Leonardo Wallpaper (/brand/nkyel-ai-ios.png)\n"
            "- 40-Hour Live Validation Cockpit, Mission Inspector & Canonical Run Event Timeline\n"
            "- Universal Production Feedback System (P0-P3 Triage, R2 Screenshots, Neon DB)\n"
            "- Product Scope Freeze (PRODUCT_FREEZE.md) & 32-vCPU VPS Deployment Guide\n\n"
            "SmartANDJ AI Technologies - Founder & Lead Architect: Daniel Jonathan ANDJ"
        )
        subprocess.run(["git", "commit", "-m", commit_msg], cwd=root_dir, check=True)
        log("[*] Push vers origin main du backend (-kyel-ai-2026)...")
        push_res = subprocess.run(["git", "push", "origin", "main"], cwd=root_dir, capture_output=True, text=True)
        if push_res.returncode == 0:
            log("[+] SUCCES : Backend & Workspace principal pushe avec succes !")
        else:
            log(f"[-] Erreur push backend : {push_res.stderr}")
            return False
    else:
        log("[i] Le depot backend est deja a jour.")

    return True


if __name__ == "__main__":
    fe_ok = push_frontend()
    be_ok = push_backend()
    if fe_ok and be_ok:
        log("\n[+] DEPLOIEMENT & SYNCHRONISATION TERMINES AVEC SUCCES POUR LE FRONTEND ET LE BACKEND !")
    else:
        log("\n[-] Une ou plusieurs etapes de push ont rencontre un probleme.")
        sys.exit(1)
