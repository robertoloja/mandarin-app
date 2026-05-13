#!/usr/bin/env python3
"""Sync local db.sqlite3 to PythonAnywhere, preserving protected remote tables.

Workflow:
  1. Download the remote DB.
  2. Overwrite every non-protected, non-skipped table with local data.
  3. Upload the merged DB back.

Protected tables (remote values kept as-is):
  sentences_sentencehistory, accounts_*

Skipped tables (identical on both sides, large — not touched):
  sentences_cedictionary, sentences_constituenthanzi, sentences_cedefinition

Required env vars (can be set in .env):
  PA_API_TOKEN   — PythonAnywhere API token (Account > API token)
  PA_USERNAME    — PythonAnywhere username (default: mandobot)
  PA_REMOTE_PATH — Absolute remote path (default: /home/{username}/mandarin-app/db.sqlite3)
"""

import http.client
import os
import sqlite3
import ssl
import sys
import tempfile
import uuid

from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()

LOCAL_DB = os.path.join(os.path.dirname(__file__), "db.sqlite3")
CHUNK_SIZE = 65_536

PROTECTED = {
    "sentences_sentencehistory",
    "accounts_mandobotuser",
    "accounts_mandobotuser_groups",
    "accounts_mandobotuser_user_permissions",
    "accounts_paidbutunregistered",
    "accounts_resetpasswordrequest",
}

SKIP = {
    "sentences_cedictionary",
    "sentences_constituenthanzi",
    "sentences_cedefinition",
}


def _https_conn() -> http.client.HTTPSConnection:
    return http.client.HTTPSConnection(
        "www.pythonanywhere.com", timeout=300, context=ssl.create_default_context()
    )


def download(token: str, username: str, remote_path: str, dest: str) -> None:
    conn = _https_conn()
    conn.request(
        "GET",
        f"/api/v0/user/{username}/files/path{remote_path}",
        headers={"Authorization": f"Token {token}"},
    )
    resp = conn.getresponse()
    if resp.status != 200:
        print(f"Download failed ({resp.status}): {resp.read().decode()}", file=sys.stderr)
        sys.exit(1)

    total = int(resp.getheader("Content-Length", 0))
    with open(dest, "wb") as f:
        with tqdm(total=total or None, unit="B", unit_scale=True, desc="Downloading") as pbar:
            while chunk := resp.read(CHUNK_SIZE):
                f.write(chunk)
                pbar.update(len(chunk))
    conn.close()


def merge(local_path: str, remote_path: str) -> None:
    """Replace non-protected, non-skipped tables in remote_path with local data."""
    local = sqlite3.connect(local_path)
    remote = sqlite3.connect(remote_path)

    tables = [
        r[0]
        for r in local.execute("SELECT name FROM sqlite_master WHERE type='table'")
        if not r[0].startswith("sqlite_")
    ]

    remote.execute("PRAGMA foreign_keys = OFF")
    for table in tables:
        if table in PROTECTED or table in SKIP:
            continue
        remote.execute(f'DELETE FROM "{table}"')
        rows = local.execute(f'SELECT * FROM "{table}"').fetchall()
        if rows:
            placeholders = ",".join(["?"] * len(rows[0]))
            remote.executemany(f'INSERT INTO "{table}" VALUES ({placeholders})', rows)

    # SKIP tables keep their remote data but may be missing new columns added by
    # migrations that ran locally.  Apply any missing columns now so Django doesn't
    # see schema drift after django_migrations is overwritten with local state.
    for table in SKIP:
        local_cols = {
            row[1]: row
            for row in local.execute(f"PRAGMA table_info('{table}')")
        }
        remote_cols = {
            row[1]
            for row in remote.execute(f"PRAGMA table_info('{table}')")
        }
        for col_name, col_info in local_cols.items():
            if col_name in remote_cols:
                continue
            col_type = col_info[2]
            default_val = col_info[4]
            ddl = f'ALTER TABLE "{table}" ADD COLUMN "{col_name}" {col_type}'
            if default_val is not None:
                ddl += f" DEFAULT {default_val}"
            remote.execute(ddl)
            print(f"  Schema sync: added {table}.{col_name}")

    remote.execute("PRAGMA foreign_keys = ON")
    remote.commit()
    local.close()
    remote.close()


def upload(token: str, username: str, remote_path: str, local_path: str) -> None:
    boundary = uuid.uuid4().hex
    mp_header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="content"; filename="db.sqlite3"\r\n'
        f"Content-Type: application/octet-stream\r\n"
        f"\r\n"
    ).encode()
    mp_footer = f"\r\n--{boundary}--\r\n".encode()

    file_size = os.path.getsize(local_path)
    content_length = len(mp_header) + file_size + len(mp_footer)

    conn = _https_conn()
    conn.putrequest("POST", f"/api/v0/user/{username}/files/path{remote_path}")
    conn.putheader("Authorization", f"Token {token}")
    conn.putheader("Content-Type", f"multipart/form-data; boundary={boundary}")
    conn.putheader("Content-Length", str(content_length))
    conn.endheaders()

    with tqdm(total=file_size, unit="B", unit_scale=True, desc="Uploading") as pbar:
        conn.send(mp_header)
        with open(local_path, "rb") as f:
            while chunk := f.read(CHUNK_SIZE):
                conn.send(chunk)
                pbar.update(len(chunk))
        conn.send(mp_footer)

    resp = conn.getresponse()
    body = resp.read()
    conn.close()

    if resp.status in (200, 201):
        print(f"Done — {file_size / 1_048_576:.1f} MB uploaded to {remote_path}")
    else:
        print(f"Upload failed ({resp.status}): {body.decode()}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    token = os.environ.get("PA_API_TOKEN")
    if not token:
        print("Error: PA_API_TOKEN is not set.", file=sys.stderr)
        sys.exit(1)

    username = os.environ.get("PA_USERNAME", "mandobot")
    remote_path = os.environ.get(
        "PA_REMOTE_PATH", f"/home/{username}/mandarin-app/db.sqlite3"
    )

    if not os.path.exists(LOCAL_DB):
        print(f"Error: {LOCAL_DB} not found.", file=sys.stderr)
        sys.exit(1)

    with tempfile.NamedTemporaryFile(suffix=".sqlite3", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        print("Downloading remote DB …")
        download(token, username, remote_path, tmp_path)

        print("Merging …")
        merge(LOCAL_DB, tmp_path)

        upload(token, username, remote_path, tmp_path)
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    main()
