import os
import shutil
import stat
import subprocess
import sys

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

def clean_temp_dirs(root_dir):
    for item in os.listdir(root_dir):
        if item.startswith('.temp_sync_'):
            p = os.path.join(root_dir, item)
            try:
                shutil.rmtree(p, onerror=remove_readonly)
            except Exception as e:
                print(f"Warning cleaning {p}: {e}")

root_dir = r'f:\Nkyel-AI-2026'
clean_temp_dirs(root_dir)

temp_dir = os.path.join(root_dir, '.temp_sync_fd')
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, onerror=remove_readonly)

print("[1/4] Cloning nkyel-fd (Vercel Frontend repo)...")
subprocess.run(['git', 'clone', '--depth', '1', 'https://github.com/ANDJsmithyboy/nkyel-fd.git', temp_dir], check=True)

src_dir = os.path.join(root_dir, 'ZION-CORE-V2')
print("[2/4] Synchronizing ZION-CORE-V2 files to nkyel-fd...")
for item in os.listdir(src_dir):
    if item in ('.git', 'node_modules', '.next', '.temp_sync_fd'):
        continue
    s = os.path.join(src_dir, item)
    d = os.path.join(temp_dir, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d, onerror=remove_readonly)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

print("[3/4] Staging and committing to nkyel-fd...")
subprocess.run(['git', 'add', '-A'], cwd=temp_dir, check=True)
status_res = subprocess.run(['git', 'status', '--porcelain'], cwd=temp_dir, capture_output=True, text=True)
if status_res.stdout.strip():
    subprocess.run(['git', 'commit', '-m', 'feat(core): Architecture modulaire souveraine Ñkyel AI - Design System Wada Sanzo, VIECanvas, MissionComposer, ActionLauncher, ArtifactStudio et Protocoles'], cwd=temp_dir, check=True)
    print("[4/4] Pushing to nkyel-fd (Vercel)...")
    subprocess.run(['git', 'push', 'origin', 'main'], cwd=temp_dir, check=True)
    print("SUCCESS: Frontend repo nkyel-fd fully pushed to Vercel!")
else:
    print("nkyel-fd is already up-to-date.")

# Clean up
try:
    shutil.rmtree(temp_dir, onerror=remove_readonly)
except Exception:
    pass

print("Sync completed cleanly.")
