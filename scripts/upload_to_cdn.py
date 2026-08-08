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

# Heavy background and stage assets to sync to CDN
CDN_ASSETS = [
    f for f in os.listdir(LOCAL_PUBLIC_DIR)
    if f.startswith("1_") or f.startswith("Adventure") or f.endswith(".jpeg")
]

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
        remote_filepath = f"{REMOTE_PATH}/{filename}"
        print(f"  Uploading {filename}...")
        sftp.put(local_filepath, remote_filepath)
        uploaded_count += 1

    sftp.close()
    transport.close()
    print(f"🎉 Successfully uploaded {uploaded_count} assets to CDN!")

except Exception as err:
    print(f"❌ SFTP Connection Error: {err}")
    print("\n💡 NOTE FOR HOSTINGER:")
    print("Ensure SSH Access is enabled in Hostinger hPanel -> Advanced -> SSH Access.")
    print("Or upload the contents of 'frontend/public/' directly to 'domains/cdn.resultspro.ng/public_html/assets/' using Hostinger File Manager.")
    sys.exit(1)
