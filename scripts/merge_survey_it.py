"""
Upsert MAYILADUTHURAI SURVEY FROM IT TEAM.xlsx into public/beneficiaries.json.
Match priority: udid -> nidc -> mob -> (name+dob). Matched records only get
blank fields filled in (never overwrite existing values). Unmatched rows are
appended as new compact-key records.
"""
import sys, io, json, math
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import pandas as pd
from normalize import clean, norm_block, norm_dis, norm_gender, norm_age

SRC_XLSX = r'C:\Users\Admin\Downloads\MAYILADUTHURAI SURVEY FROM IT TEAM.xlsx'
BENEFICIARIES_JSON = 'public/beneficiaries.json'


def norm_key(v):
    if not v:
        return None
    s = str(v).strip().lower()
    return s if s and s != 'nan' else None


def norm_nature(v):
    if not v:
        return None
    u = v.upper()
    if 'PERMANENT' in u:
        return 'Permanent'
    if 'TEMPORARY' in u:
        return 'Temporary'
    return None


def norm_aad(v):
    if not v:
        return None
    u = v.upper()
    if 'FILLED' in u or 'AVAILABLE' in u:
        return 'Aadhaar Available'
    if 'BLANK' in u:
        return 'Aadhaar Blank'
    return None


def row_to_compact(row):
    dob = clean(row.get('DOB'))
    mob_raw = row.get('Mobile')
    mob = None
    if mob_raw is not None and not (isinstance(mob_raw, float) and math.isnan(mob_raw)):
        mob = str(int(mob_raw)) if isinstance(mob_raw, float) else clean(mob_raw)
    pds = clean(row.get('new_pds_number')) or clean(row.get('old_pds_number'))
    r = {
        'n': clean(row.get('name_in_english')),
        'dob': dob,
        'age': str(norm_age(dob)) if norm_age(dob) is not None else clean(row.get('Age')),
        'g': norm_gender(clean(row.get('Gender'))),
        'mob': mob,
        'blk': norm_block(clean(row.get('PA_Block'))),
        'pds': pds,
        'nidc': clean(row.get('NIDC_Number')),
        'udid': clean(row.get('UDID_Number')),
        'aad': norm_aad(clean(row.get('Aadhaar_Status'))),
        'dis': norm_dis(clean(row.get('Disability_Type'))),
        'dpct': clean(row.get('Disability_Percentage')),
        'nat': norm_nature(clean(row.get('Nature_Of_Disability'))),
        'dreason': clean(row.get('Disability_Reason')),
        'vil': clean(row.get('PA_Village')),
        'tal': clean(row.get('PA_Taluk')),
        'pin': clean(row.get('PA_Pincode')),
        'door': clean(row.get('PA_Door_No')),
        'str': clean(row.get('PA_Street_Name')),
        'area': clean(row.get('PA_Area_Type')),
        'stat': clean(row.get('member_status_label')),
        'dap': clean(row.get('DAP_Name')) or clean(row.get('name_in_english')),
        'pcare': clean(row.get('Primary_Care_Provider')),
    }
    return {k: v for k, v in r.items() if v is not None}


def main():
    print('Loading existing beneficiaries.json...')
    with open(BENEFICIARIES_JSON, encoding='utf-8') as f:
        existing = json.load(f)
    print(f'  {len(existing)} existing records')

    idx_udid, idx_nidc, idx_mob, idx_namedob = {}, {}, {}, {}
    for r in existing:
        ku = norm_key(r.get('udid'))
        if ku: idx_udid.setdefault(ku, r)
        kn = norm_key(r.get('nidc'))
        if kn: idx_nidc.setdefault(kn, r)
        km = norm_key(r.get('mob'))
        if km: idx_mob.setdefault(km, r)
        name_k = norm_key(r.get('n'))
        dob_k = norm_key(r.get('dob'))
        if name_k and dob_k:
            idx_namedob.setdefault((name_k, dob_k), r)

    print('Reading survey_IT excel...')
    df = pd.read_excel(SRC_XLSX, sheet_name='Sheet1')
    print(f'  {len(df)} rows')

    matched = 0
    filled_fields = 0
    appended = 0
    skipped_no_name = 0

    for _, row in df.iterrows():
        compact = row_to_compact(row)
        if not compact.get('n'):
            skipped_no_name += 1
            continue

        target = None
        ku = norm_key(compact.get('udid'))
        kn = norm_key(compact.get('nidc'))
        km = norm_key(compact.get('mob'))
        name_k = norm_key(compact.get('n'))
        dob_k = norm_key(compact.get('dob'))

        if ku and ku in idx_udid:
            target = idx_udid[ku]
        elif kn and kn in idx_nidc:
            target = idx_nidc[kn]
        elif km and km in idx_mob:
            target = idx_mob[km]
        elif name_k and dob_k and (name_k, dob_k) in idx_namedob:
            target = idx_namedob[(name_k, dob_k)]

        if target is not None:
            matched += 1
            for k, v in compact.items():
                if k == 'n':
                    continue
                if not target.get(k) or str(target.get(k)).lower() == 'nan':
                    target[k] = v
                    filled_fields += 1
        else:
            existing.append(compact)
            appended += 1
            # index the newly appended record too, so later duplicate rows
            # within survey_IT itself match against it instead of double-appending
            if ku: idx_udid.setdefault(ku, compact)
            if kn: idx_nidc.setdefault(kn, compact)
            if km: idx_mob.setdefault(km, compact)
            if name_k and dob_k: idx_namedob.setdefault((name_k, dob_k), compact)

    print(f'Matched: {matched}, fields filled: {filled_fields}, appended new: {appended}, skipped (no name): {skipped_no_name}')
    print(f'Final record count: {len(existing)}')

    with open(BENEFICIARIES_JSON, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False)
    print('Wrote', BENEFICIARIES_JSON)


if __name__ == '__main__':
    main()
