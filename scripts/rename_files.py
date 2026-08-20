import os
import re

ROOT_DIR = r"f:\Nkyel-AI-2026"
EXCLUDE_DIRS = ['backend\\app', 'node_modules', '.git', '.next']

def should_exclude(path):
    for ex in EXCLUDE_DIRS:
        if ex in path:
            return True
    return False

def rename_gaboma_files_and_dirs():
    count = 0
    # Bottom-up traversal so that renaming a parent dir doesn't break child paths
    for root, dirs, files in os.walk(ROOT_DIR, topdown=False):
        if should_exclude(root):
            continue
            
        # Rename files
        for filename in files:
            if re.search(r'gaboma', filename, re.IGNORECASE):
                # Preserve case for Gaboma -> Nkyel, gaboma -> nkyel, GABOMA -> NKYEL
                new_filename = filename.replace('Gaboma', 'Nkyel').replace('gaboma', 'nkyel').replace('GABOMA', 'NKYEL')
                
                old_path = os.path.join(root, filename)
                new_path = os.path.join(root, new_filename)
                
                try:
                    os.rename(old_path, new_path)
                    print(f"RENAMED FILE: {old_path} -> {new_path}")
                    count += 1
                except Exception as e:
                    print(f"ERROR renaming {old_path}: {e}")
                    
        # Rename dirs
        for dirname in dirs:
            if re.search(r'gaboma', dirname, re.IGNORECASE):
                new_dirname = dirname.replace('Gaboma', 'Nkyel').replace('gaboma', 'nkyel').replace('GABOMA', 'NKYEL')
                
                old_path = os.path.join(root, dirname)
                new_path = os.path.join(root, new_dirname)
                
                try:
                    os.rename(old_path, new_path)
                    print(f"RENAMED DIR: {old_path} -> {new_path}")
                    count += 1
                except Exception as e:
                    print(f"ERROR renaming {old_path}: {e}")

    print(f"\nTotal items renamed: {count}")

if __name__ == "__main__":
    rename_gaboma_files_and_dirs()
