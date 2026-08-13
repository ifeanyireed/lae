#!/usr/bin/env python3
import os
import sys
import paramiko

HOST = os.getenv("CDN_HOST", "82.29.191.184")
PORT = int(os.getenv("CDN_PORT", "65002"))
USERNAME = os.getenv("CDN_USER", "u721451974")
PASSWORD = os.getenv("CDN_PASS", "*Reedb4b4")
REMOTE_PATH = os.getenv("CDN_REMOTE_PATH", "domains/resultspro.ng/public_html/cdn/assets")

LOCAL_PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/public"))

# Include all optimized vector, image, video, and background assets
CDN_ASSETS = []
for root, dirs, files in os.walk(LOCAL_PUBLIC_DIR):
    for f in files:
        if not f.startswith('.') and f.endswith(('.svg', '.jpg', '.jpeg', '.png', '.mov', '.mp4', '.webm')):
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, LOCAL_PUBLIC_DIR)
            CDN_ASSETS.append(rel_p)

print(f"🚀 Preparing to sync {len(CDN_ASSETS)} assets to CDN ({HOST}:{PORT} -> {REMOTE_PATH})...")

try:
    transport = paramiko.Transport((HOST, PORT))
    transport.connect(username=USERNAME, password=PASSWORD)
    sftp = paramiko.SFTPClient.from_transport(transport)
    print("✅ Connected to SFTP server successfully.")

    # Ensure remote nested assets directory exists
    path_parts = REMOTE_PATH.strip("/").split("/")
    curr_path = ""
    for part in path_parts:
        curr_path += "/" + part
        try:
            sftp.mkdir(curr_path)
        except IOError:
            pass

    uploaded_count = 0
    for filename in CDN_ASSETS:
        local_filepath = os.path.join(LOCAL_PUBLIC_DIR, filename)
        remote_filepath = f"{REMOTE_PATH}/{filename}".replace("\\", "/")
        
        # Ensure remote parent directory exists
        remote_dir = os.path.dirname(remote_filepath)
        dir_parts = remote_dir.strip("/").split("/")
        c_path = ""
        for p in dir_parts:
            c_path += "/" + p
            try:
                sftp.mkdir(c_path)
            except IOError:
                pass
                
        print(f"  Uploading {filename}...")
        try:
            sftp.put(local_filepath, remote_filepath)
            uploaded_count += 1
        except Exception as e:
            print(f"  ❌ Error uploading {filename}: {e}")

    sftp.close()
    transport.close()
    print(f"🎉 Successfully uploaded {uploaded_count} assets to CDN!")

except Exception as err:
    print(f"❌ SFTP Connection Error: {err}")
    print("\n💡 NOTE FOR HOSTINGER:")
    print("Ensure SSH Access is enabled in Hostinger hPanel -> Advanced -> SSH Access.")
    print("Or upload the contents of 'frontend/public/' directly to 'domains/cdn.resultspro.ng/public_html/assets/' using Hostinger File Manager.")
    sys.exit(1)
