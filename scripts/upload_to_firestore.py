"""
Upload Excel survey data to Firestore.
Uses REST API directly (no service account needed for open Firestore rules).
Run: python scripts/upload_to_firestore.py
"""
import pandas as pd
import requests
import json
import sys
import io
import math
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

PROJECT_ID = "mydda-9b089"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

def clean_val(v):
    if v is None: return None
    if isinstance(v, float) and math.isnan(v): return None
    if hasattr(v, 'item'): v = v.item()
    return str(v).strip() if str(v).strip() not in ('nan', 'NaT', 'None', '') else None

def to_firestore_doc(row):
    fields = {}
    for k, v in row.items():
        val = clean_val(v)
        if val is not None:
            fields[str(k)] = {"stringValue": val}
    return {"fields": fields}

def clean_id(name, pds):
    n = str(name).strip().replace(' ', '_').replace('/', '_')[:40] if name else 'unknown'
    p = str(pds).strip()[:12] if pds else ''
    return f"{n}_{p}"

print("Reading Excel file...")
df = pd.read_excel(r'C:\Users\Admin\Downloads\MAYILADUTHURAI_surveylist till 1-2026.xlsx')
print(f"Loaded {len(df)} records")

# Add search index fields (lowercase for case-insensitive search)
df['_name_lower'] = df['name_in_english'].astype(str).str.lower().str.strip()
df['_mobile'] = df['Mobile'].astype(str).str.strip()
df['_nidc'] = df['NIDC_Number'].astype(str).str.strip()
df['_udid'] = df['UDID_Number'].astype(str).str.strip()
df['_voter'] = df['Voter_ID'].astype(str).str.strip()
df['_pds'] = df['new_pds_number'].astype(str).str.strip()

BATCH_SIZE = 200
total = len(df)
success = 0
fail = 0

print(f"Uploading {total} records in batches of {BATCH_SIZE}...")

for start in range(0, total, BATCH_SIZE):
    batch = df.iloc[start:start+BATCH_SIZE]
    writes = []
    for _, row in batch.iterrows():
        doc_id = clean_id(row.get('name_in_english'), row.get('new_pds_number'))
        writes.append({
            "update": {
                "name": f"projects/{PROJECT_ID}/databases/(default)/documents/beneficiaries/{doc_id}",
                "fields": to_firestore_doc(row)["fields"]
            }
        })

    payload = {"writes": writes}
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:batchWrite"
    resp = requests.post(url, json=payload, timeout=30)

    if resp.status_code == 200:
        success += len(batch)
        pct = int((start + len(batch)) / total * 100)
        print(f"  [{pct:3d}%] {start+len(batch)}/{total} uploaded", end='\r')
    else:
        print(f"\n  ERROR batch {start}: {resp.status_code} - {resp.text[:200]}")
        fail += len(batch)

    time.sleep(0.1)

print(f"\nDone. Success: {success}, Failed: {fail}")
