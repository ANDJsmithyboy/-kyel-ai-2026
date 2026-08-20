import os
import shutil
import subprocess

temp_dir = os.path.join(os.environ.get('TEMP', r'C:\Temp'), 'nkyel-fd-sync')
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir, ignore_errors=True)

print("Cloning nkyel-fd...")
subprocess.run(['git', 'clone', '--depth', '1', 'https://github.com/ANDJsmithyboy/nkyel-fd.git', temp_dir], check=True)

src_dir = r'f:\Nkyel-AI-2026\ZION-CORE-V2'
print("Copying updated files...")
for item in os.listdir(src_dir):
    if item in ('.git', 'node_modules', '.next'):
        continue
    s = os.path.join(src_dir, item)
    d = os.path.join(temp_dir, item)
    if os.path.isdir(s):
        if os.path.exists(d):
            shutil.rmtree(d)
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

print("Committing and pushing to nkyel-fd (Vercel)...")
subprocess.run(['git', 'add', '-A'], cwd=temp_dir, check=True)
res = subprocess.run(['git', 'commit', '-m', 'feat: update full interactive chat and streaming fixes'], cwd=temp_dir)
subprocess.run(['git', 'push', 'origin', 'main'], cwd=temp_dir, check=True)
print("SUCCESS: Pushed to Vercel repository!")
