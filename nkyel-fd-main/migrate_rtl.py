import os
import re

def migrate_tailwind_rtl(directory):
    replacements = [
        # Margin
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)ml-([0-9a-zA-Z\.\[\]\-]+)'), r'\1ms-\2'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)mr-([0-9a-zA-Z\.\[\]\-]+)'), r'\1me-\2'),
        # Padding
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)pl-([0-9a-zA-Z\.\[\]\-]+)'), r'\1ps-\2'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)pr-([0-9a-zA-Z\.\[\]\-]+)'), r'\1pe-\2'),
        # Text alignment
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)text-left\b'), r'\1text-start'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)text-right\b'), r'\1text-end'),
        # Positioning
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)left-([0-9a-zA-Z\.\[\]\-]+)'), r'\1start-\2'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)right-([0-9a-zA-Z\.\[\]\-]+)'), r'\1end-\2'),
        # Border
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)border-l\b'), r'\1border-s'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)border-r\b'), r'\1border-e'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)border-l-([0-9a-zA-Z\.\[\]\-]+)'), r'\1border-s-\2'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)border-r-([0-9a-zA-Z\.\[\]\-]+)'), r'\1border-e-\2'),
        # Rounded
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)rounded-l\b'), r'\1rounded-s'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)rounded-r\b'), r'\1rounded-e'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)rounded-l-([0-9a-zA-Z\.\[\]\-]+)'), r'\1rounded-s-\2'),
        (re.compile(r'(?<![a-zA-Z0-9-])([a-z0-9:-]*)rounded-r-([0-9a-zA-Z\.\[\]\-]+)'), r'\1rounded-e-\2'),
    ]

    files_modified = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, replacement in replacements:
                    new_content = pattern.sub(replacement, new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    files_modified += 1
                    print(f"Migrated: {filepath}")

    print(f"Total files modified: {files_modified}")

if __name__ == "__main__":
    migrate_tailwind_rtl(r'f:\Nkyel-AI-2026\nkyel-fd-main\src')
