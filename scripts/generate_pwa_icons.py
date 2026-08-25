"""
Generate all PWA and Multi-Platform Icons for Nkyel AI & SmartANDJ Ecosystem.
Sources:
- nkyel-ai-android.png
- nkyel-ai-ios.png
"""

import os
import shutil
from PIL import Image

def generate_icons():
    root = r"F:\Nkyel-AI-2026"
    android_src = os.path.join(root, "nkyel-ai-android.png")
    ios_src = os.path.join(root, "nkyel-ai-ios.png")

    targets = [
        os.path.join(root, "nkyel-fd-main", "public"),
        os.path.join(root, "ZION-CORE-V2", "public"),
    ]

    img_android = Image.open(android_src).convert("RGBA")
    img_ios = Image.open(ios_src).convert("RGBA")

    for public_dir in targets:
        os.makedirs(public_dir, exist_ok=True)
        brand_dir = os.path.join(public_dir, "brand")
        os.makedirs(brand_dir, exist_ok=True)

        print(f"[*] Processing icons for {public_dir}...")

        # 1. Copy source files
        shutil.copy2(android_src, os.path.join(public_dir, "nkyel-ai-android.png"))
        shutil.copy2(ios_src, os.path.join(public_dir, "nkyel-ai-ios.png"))
        shutil.copy2(android_src, os.path.join(brand_dir, "nkyel-ai-android.png"))
        shutil.copy2(ios_src, os.path.join(brand_dir, "nkyel-ai-ios.png"))

        # 2. Android PWA Icons (192, 512, maskable)
        for size in [192, 512]:
            resized = img_android.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(os.path.join(public_dir, f"icon-{size}x{size}.png"), "PNG")
            resized.save(os.path.join(public_dir, f"icon-{size}.png"), "PNG")
            resized.save(os.path.join(public_dir, f"android-chrome-{size}x{size}.png"), "PNG")
            resized.save(os.path.join(public_dir, f"maskable-icon-{size}x{size}.png"), "PNG")

        # 3. iOS Apple Touch Icons (180, 167, 152, 120)
        for size in [180, 167, 152, 120]:
            resized_ios = img_ios.resize((size, size), Image.Resampling.LANCZOS)
            resized_ios.save(os.path.join(public_dir, f"apple-touch-icon-{size}x{size}.png"), "PNG")
        
        # Primary apple-touch-icon.png (180x180) & precomposed
        touch_180 = img_ios.resize((180, 180), Image.Resampling.LANCZOS)
        touch_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")
        touch_180.save(os.path.join(public_dir, "apple-touch-icon-precomposed.png"), "PNG")

        # 4. Favicons (16, 32, 48, 64) & ICO
        fav_32 = img_ios.resize((32, 32), Image.Resampling.LANCZOS)
        fav_32.save(os.path.join(public_dir, "favicon-32x32.png"), "PNG")
        fav_16 = img_ios.resize((16, 16), Image.Resampling.LANCZOS)
        fav_16.save(os.path.join(public_dir, "favicon-16x16.png"), "PNG")
        
        # Standard favicon.png (64x64)
        fav_64 = img_ios.resize((64, 64), Image.Resampling.LANCZOS)
        fav_64.save(os.path.join(public_dir, "favicon.png"), "PNG")

        # favicon.ico with multiple sizes
        img_ios.save(
            os.path.join(public_dir, "favicon.ico"),
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128)]
        )

        # 5. Legacy aliases updated to high quality
        fav_128 = img_ios.resize((128, 128), Image.Resampling.LANCZOS)
        fav_128.save(os.path.join(public_dir, "nkyel-logo.png"), "PNG")
        fav_128.save(os.path.join(public_dir, "nkyel-icon.png"), "PNG")

    print("[+] All icons generated and synchronized successfully!")

if __name__ == "__main__":
    generate_icons()
