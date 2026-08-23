r"""
Ñkyel AI — Synchronisation et Push du VRAI Frontend (nkyel-fd-main -> nkyel-fd)
SmartANDJ AI Technologies · Fondateur : Daniel Jonathan ANDJ
"""

import os
import shutil
import stat
import subprocess
import time
import sys


def log(msg: str):
    try:
        print(msg, flush=True)
    except Exception:
        print(msg.encode("ascii", "replace").decode("ascii"), flush=True)


def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)


root_dir = r"f:\Nkyel-AI-2026"
src_dir = os.path.join(root_dir, "nkyel-fd-main")
temp_dir = os.path.join(root_dir, f".temp_sync_fd_{int(time.time())}")

log(f"[1/4] Cloning nkyel-fd into {temp_dir}...")
res = subprocess.run(
    ["git", "clone", "--depth", "1", "https://github.com/ANDJsmithyboy/nkyel-fd.git", temp_dir],
    capture_output=True,
    text=True,
)
if res.returncode != 0:
    log(f"[-] Erreur clonage: {res.stderr}")
    sys.exit(1)

log("[2/4] Synchronizing files from nkyel-fd-main...")
ignored = {".git", "node_modules", ".next", ".turbo", "tsconfig.tsbuildinfo"}

# Remove old files except .git
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

# Copy from nkyel-fd-main
for item in os.listdir(src_dir):
    if item in ignored:
        continue
    s = os.path.join(src_dir, item)
    d = os.path.join(temp_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

log("[3/4] Staging and committing in nkyel-fd...")
subprocess.run(["git", "config", "core.autocrlf", "true"], cwd=temp_dir)
subprocess.run(["git", "add", "-A"], cwd=temp_dir, check=True)

status_res = subprocess.run(["git", "status", "--porcelain"], cwd=temp_dir, capture_output=True, text=True)
if status_res.stdout.strip():
    commit_msg = (
        "feat(frontend): Production Integration — Real API client, Canonical Events, "
        "Vision & Visual Agent Studio, VIECanvas, Wada Sanzo Design System (nkyel-fd-main)"
    )
    subprocess.run(["git", "commit", "-m", commit_msg], cwd=temp_dir, check=True)
    log("[4/4] Pushing to nkyel-fd (Vercel)...")
    push_res = subprocess.run(["git", "push", "origin", "main"], cwd=temp_dir, capture_output=True, text=True)
    if push_res.returncode == 0:
        log("[+] SUCCES TOTAL : Le VRAI Frontend (nkyel-fd-main) est pushe vers nkyel-fd sur Vercel !")
    else:
        log(f"[-] Erreur push : {push_res.stderr}")
else:
    log("[i] nkyel-fd est deja a jour avec nkyel-fd-main.")

try:
    shutil.rmtree(temp_dir, onerror=remove_readonly)
except Exception:
    pass

log("[+] Termine avec succes !")
