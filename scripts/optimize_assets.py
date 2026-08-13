#!/usr/bin/env python3
import os
import sys
import glob
import re
import base64
import io
import shutil
import subprocess
from PIL import Image

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/public"))

def optimize_jpgs(directory, max_dim=800, quality=82):
    jpg_files = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg')) and not f.startswith('.'):
                jpg_files.append(os.path.join(root, f))
                
    if not jpg_files:
        print("ℹ️ No JPG files found.")
        return 0, 0

    print(f"🖼️  Optimizing {len(jpg_files)} JPG/JPEG images...")
    orig_total = sum(os.path.getsize(f) for f in jpg_files)
    
    for jpg_path in sorted(jpg_files):
        try:
            size_before = os.path.getsize(jpg_path) / 1024
            img = Image.open(jpg_path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
                
            if img.width > max_dim or img.height > max_dim:
                img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
                
            img.save(jpg_path, format='JPEG', quality=quality, optimize=True)
            size_after = os.path.getsize(jpg_path) / 1024
            diff = ((size_after - size_before) / size_before) * 100 if size_before > 0 else 0
            print(f"  [{os.path.basename(jpg_path)}] {size_before:.1f} KB -> {size_after:.1f} KB ({diff:.1f}%)")
        except Exception as e:
            print(f"  ❌ Error optimizing {jpg_path}: {e}")
            
    new_total = sum(os.path.getsize(f) for f in jpg_files)
    saved_mb = (orig_total - new_total) / (1024 * 1024)
    print(f"✅ JPG Optimization complete! Saved {saved_mb:.2f} MB.\n")
    return orig_total, new_total

def optimize_svgs(directory, max_dim=600):
    svg_files = []
    for root, dirs, files in os.walk(directory):
        for f in files:
            if f.lower().endswith('.svg') and not f.startswith('.'):
                svg_files.append(os.path.join(root, f))
                
    if not svg_files:
        print("ℹ️ No SVG files found.")
        return 0, 0

    print(f"🎨 Optimizing {len(svg_files)} SVG files...")
    orig_total = sum(os.path.getsize(f) for f in svg_files)
    
    for svg_path in sorted(svg_files):
        filename = os.path.basename(svg_path)
        try:
            size_before = os.path.getsize(svg_path) / 1024
            with open(svg_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

            match = re.search(r'data:image/(png|jpeg|jpg);base64,([A-Za-z0-9+/=\s]+)', content)
            if match:
                img_type, b64_str = match.groups()
                b64_clean = re.sub(r'\s+', '', b64_str)
                raw_bytes = base64.b64decode(b64_clean)
                img = Image.open(io.BytesIO(raw_bytes))

                # Background canvas images vs avatar icons
                target_dim = 1000 if 'maze' in filename or '_' in filename else max_dim

                if img.width > target_dim or img.height > target_dim:
                    img.thumbnail((target_dim, target_dim), Image.Resampling.LANCZOS)

                out_buf = io.BytesIO()
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')

                img.save(out_buf, format='PNG', optimize=True, compress_level=9)
                new_b64 = base64.b64encode(out_buf.getvalue()).decode('utf-8')

                new_content = content[:match.start()] + f'data:image/png;base64,{new_b64}' + content[match.end():]
                with open(svg_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            else:
                compacted = re.sub(r'>\s+<', '><', content).strip()
                with open(svg_path, 'w', encoding='utf-8') as f:
                    f.write(compacted)

            size_after = os.path.getsize(svg_path) / 1024
            diff = ((size_after - size_before) / size_before) * 100 if size_before > 0 else 0
            if abs(diff) > 1.0:
                print(f"  [{filename}] {size_before:.1f} KB -> {size_after:.1f} KB ({diff:.1f}%)")
        except Exception as e:
            print(f"  ❌ Error optimizing {filename}: {e}")

    new_total = sum(os.path.getsize(f) for f in svg_files)
    saved_mb = (orig_total - new_total) / (1024 * 1024)
    print(f"✅ SVG Optimization complete! Saved {saved_mb:.2f} MB.\n")
    return orig_total, new_total

def main():
    target_path = sys.argv[1] if len(sys.argv) > 1 else PUBLIC_DIR
    print(f"🚀 Target Directory: {target_path}\n")

    if not os.path.exists(target_path):
        print(f"❌ Directory path '{target_path}' does not exist.")
        sys.exit(1)

    jpg_orig, jpg_new = optimize_jpgs(target_path)
    svg_orig, svg_new = optimize_svgs(target_path)

    total_saved = ((jpg_orig + svg_orig) - (jpg_new + svg_new)) / (1024 * 1024)
    print(f"🎉 Asset Optimization Finished! Total Saved: {total_saved:.2f} MB")
    print("💡 To upload all assets to CDN, run: npm run cdn:deploy")

if __name__ == "__main__":
    main()
