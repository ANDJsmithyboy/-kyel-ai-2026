import os
import shutil
import stat
import subprocess
import time

def remove_readonly(func, path, excinfo):
    os.chmod(path, stat.S_IWRITE)
    func(path)

temp_dir = os.path.join(os.environ.get('TEMP', r'C:\Temp'), f'nkyel-fd-sync-{int(time.time())}')

print(f"Cloning nkyel-fd into {temp_dir}...")
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
