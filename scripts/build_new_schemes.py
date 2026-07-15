"""
Parse the 5 new scheme/list Excel files into compact-key JSON (public/*.json,
matching the scooty.json convention: flat array, 'src' tag per record) plus
matching stat modules in src/data/ (same shape as scootyStats.js).
"""
import sys, io, json, re, math
from datetime import datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import pandas as pd
from normalize import clean, norm_gender

DOWNLOADS = r'C:\Users\Admin\Downloads'

CASTE_SHORT_MAP = {
    'SC': 'Scheduled Caste', 'ST': 'Scheduled Tribes', 'BC': 'Backward Classes',
    'MBC': 'Most Backward Classes', 'OC': 'Other Classes',
}


def mob_str(v):
    if v is None:
        return None
    if isinstance(v, float):
        if math.isnan(v):
            return None
        v = int(v)
    s = str(v).strip().replace('\n', '').replace(' ', '')
    return s if s and s.lower() != 'nan' else None


def strip_nl(v):
    v = clean(v)
    return v.replace('\n', '').replace('\r', '').strip() if v else None


def collapse_ws(v):
    v = clean(v)
    if not v:
        return None
    return re.sub(r'\s+', ' ', v.replace('\n', ' ')).strip()


def split_cast_age(raw):
    raw = clean(raw)
    if not raw:
        return None, None
    parts = [p.strip() for p in raw.replace('\n', '/').split('/') if p.strip()]
    if not parts:
        return None, None
    age = parts[0] if parts[0].isdigit() else None
    caste_raw = re.sub(r'\s+', '', parts[-1]).upper() if len(parts) > 1 else None
    caste = CASTE_SHORT_MAP.get(caste_raw, caste_raw)
    return age, caste


def pct_str(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    try:
        f = float(v)
    except (ValueError, TypeError):
        return clean(v)
    # source stores most percentages as a fraction (0.5 = 50%), but a few rows
    # were mis-entered as the whole number already (40 meaning 40%, not 4000%)
    return f'{round(f * 100)}%' if f <= 1 else f'{round(f)}%'


# ---------------------------------------------------------------------------
# MG (Marriage Assistance)
# ---------------------------------------------------------------------------

def norm_mg_dis(raw):
    raw = clean(raw)
    if not raw:
        return None
    u = raw.upper()
    if 'MENTALLY RETARDED' in u or 'INTELLECTUAL' in u:
        return 'Intellectual Disability'
    if 'SEVERE DISABILITY' in u:
        return 'Multiple Disabilities'
    if 'LEPROSY' in u:
        return 'Leprosy Cured'
    if 'MUSCULAR' in u:
        return 'Muscular Dystrophy'
    if 'SPINAL CORD INJURY' in u and 'CHRONIC' in u:
        return 'Spinal Cord Injury & Chronic Neurological'
    if 'SPINAL CORD INJURY' in u:
        return 'Spinal Cord Injury'
    if 'AUTISM' in u:
        return 'Autism Spectrum'
    if 'PARKINSON' in u:
        return 'Parkinsons Disease'
    if 'MULTIPLE SCLEROSIS' in u:
        return 'Multiple Sclerosis'
    return None


def build_mg():
    df = pd.read_excel(f'{DOWNLOADS}\\ALL MG LIST 4-26(1).xlsx', sheet_name=0, header=0)
    records = []
    for _, row in df.iterrows():
        n = clean(row.get('Beneficiary_Name'))
        if not n:
            continue
        dist = clean(row.get('CurrentDistrict'))
        tal = clean(row.get('CurrentTaluk'))
        r = {
            'src': 'mg',
            'n': n,
            'mob': mob_str(row.get('Mobile')),
            'dist': dist.title() if dist else None,
            'tal': tal.title() if tal else None,
            'dis': norm_mg_dis(row.get('TOD')),
        }
        records.append({k: v for k, v in r.items() if v is not None})
    return records


# ---------------------------------------------------------------------------
# Scholarship / Readers Allowance short disability codes
# ---------------------------------------------------------------------------

SCHOL_DIS_MAP = {
    'ID': 'Intellectual Disability', 'LD': 'Locomotor Disability', 'HI': 'Hearing Impairment',
    'VI': 'Blindness', 'MUD': 'Muscular Dystrophy', 'HOH': 'Hearing Impairment',
    'LV': 'Low Vision', 'CP': 'Cerebral Palsy', 'MD': 'Multiple Disabilities',
    'ASD': 'Autism Spectrum', 'HE': 'Haemophilia', 'MI': 'Mental Illness',
    'SLD': 'Specific Learning', 'MR': 'Intellectual Disability', 'DEAF': 'Hearing Impairment',
    'HARD OF HEARING': 'Hearing Impairment', 'BLINDNESS': 'Blindness',
}


def norm_schol_dis(raw):
    raw = clean(raw)
    if not raw:
        return None
    u = raw.strip().upper()
    return SCHOL_DIS_MAP.get(u)


def build_scholarship():
    df = pd.read_excel(f'{DOWNLOADS}\\SCHOLARSHIP BENEFICIARIES 2025-2026 OVERALL.xlsx', sheet_name=0, skiprows=1)
    df.columns = [str(c).strip() for c in df.columns]
    records = []
    for _, row in df.iterrows():
        n = clean(row.get('Student Name'))
        if not n:
            continue
        age, caste = split_cast_age(row.get('Cast / Age'))
        r = {
            'src': 'scholarship',
            'n': n,
            'father': collapse_ws(row.get('Father Name & Address')),
            'g': norm_gender(clean(row.get('Sex'))),
            'age': age,
            'caste': caste,
            'mob': mob_str(row.get('Condact No.')),
            'dis': norm_schol_dis(row.get('Type Of Disability')),
            'dpct': pct_str(row.get('Percentage')),
            'aadhar': mob_str(row.get('Aadhar No')),
            'nidc': clean(row.get('NIDC NO')),
            'udid': clean(row.get('UDID NO')),
            'acc': mob_str(row.get('A/C Number')),
            'ifsc': clean(row.get('IFSC')),
            'bank': clean(row.get('Bank Name and Brance')),
            'cls': clean(row.get('Class')),
            'amt': mob_str(row.get('Amount')),
            'app_no': clean(row.get('Application No')),
        }
        records.append({k: v for k, v in r.items() if v is not None})
    return records


def build_readers():
    df = pd.read_excel(f'{DOWNLOADS}\\2025-2026 - Readers Allowance Sanction List.xlsx', sheet_name=0, skiprows=1)
    df.columns = [re.sub(r'\s+', ' ', str(c).replace('\n', ' ')).strip() for c in df.columns]
    records = []
    for _, row in df.iterrows():
        n = clean(row.get('Student Name'))
        if not n:
            continue
        age, caste = split_cast_age(row.get('Cast / Age'))
        amt = clean(row.get('Amount'))
        if amt:
            amt = amt.replace('/-', '').strip()
        r = {
            'src': 'readers',
            'n': n,
            'father': collapse_ws(row.get('Father Name & Address')),
            'g': norm_gender(clean(row.get('Sex'))),
            'age': age,
            'caste': caste,
            'mob': mob_str(row.get('Mobile No')),
            'dis': norm_schol_dis(row.get('Type Of Disability')),
            'dpct': pct_str(row.get('Percentage')),
            'aadhar': mob_str(row.get('Aadhar No')),
            'rc': strip_nl(row.get('RATION CARD NO.')),
            'nidc': strip_nl(row.get('NIDC NO')),
            'udid': strip_nl(row.get('UDID NO')),
            'acc': strip_nl(row.get('A/C Number')),
            'ifsc': clean(row.get('IFSC')),
            'bank': collapse_ws(row.get('Bank Name and Branch')),
            'cls': clean(row.get('Class')),
            'amt': amt,
            'app_no': strip_nl(row.get('Application No')),
        }
        records.append({k: v for k, v in r.items() if v is not None})
    return records


# ---------------------------------------------------------------------------
# Bank Loan
# ---------------------------------------------------------------------------

BANKLOAN_DIS_MAP = {
    'LD': 'Locomotor Disability', 'VI': 'Blindness', 'HI': 'Hearing Impairment',
    'CP-MR': 'Cerebral Palsy', 'MR': 'Intellectual Disability', 'LV': 'Low Vision',
    'DWARFISM': 'Dwarfism', 'MD': 'Multiple Disabilities', 'CP': 'Cerebral Palsy',
    'ID': 'Intellectual Disability',
}


def split_dis_pct(raw):
    raw = clean(raw)
    if not raw:
        return None, None
    s = raw.strip()
    i = 0
    while i < len(s) and not s[i].isdigit():
        i += 1
    code = s[:i].strip(' -').upper()
    digits = ''.join(ch for ch in s[i:] if ch.isdigit())
    dis = BANKLOAN_DIS_MAP.get(code)
    pct = f'{digits}%' if digits else None
    return dis, pct


def date_str(v):
    if v is None:
        return None
    if isinstance(v, datetime):
        return v.strftime('%d-%m-%Y')
    s = str(v).replace('\xa0', '').strip()
    return s or None


def build_bankloan():
    df = pd.read_excel(f'{DOWNLOADS}\\BANK LOAN BENEFICIARIES 2025-2026.xlsx', sheet_name=0, skiprows=1)
    df.columns = [str(c).strip() for c in df.columns]
    records = []
    for _, row in df.iterrows():
        n = clean(row.get('Name of the Applicant'))
        if not n:
            continue
        dis, dpct = split_dis_pct(row.get('Type of Disability and Percentage'))
        age = row.get('Age')
        try:
            age = str(int(float(age))) if age is not None and not (isinstance(age, float) and math.isnan(age)) else None
        except (ValueError, TypeError):
            age = clean(age)
        r = {
            'src': 'bankloan',
            'n': n,
            'addr': collapse_ws(row.get('Address')),
            'age': age,
            'g': norm_gender(clean(row.get('Gender Details'))),
            'caste': CASTE_SHORT_MAP.get(str(clean(row.get('Cast')) or '').upper(), clean(row.get('Cast'))),
            'dis': dis,
            'dpct': dpct,
            'mob': mob_str(row.get('Mobile No')),
            'aadhar': mob_str(row.get('Aadhar No')),
            'udid': clean(row.get('UDID No')),
            'nidc': clean(row.get('NIDC No')),
            'bank': clean(row.get('Name of the Bank')),
            'branch': clean(row.get('Name of the Branch')),
            'business': clean(row.get('Business Name')),
            'loan_amt': mob_str(row.get('Loan Amount Require')),
            'subsidy_amt': mob_str(row.get('Subsidy Amount')),
            'app_no': clean(row.get('Application No')),
            'app_date': date_str(row.get('Application Date')),
        }
        records.append({k: v for k, v in r.items() if v is not None})
    return records


# ---------------------------------------------------------------------------
# UDID Uncovered
# ---------------------------------------------------------------------------

def na_dash(v):
    v = clean(v)
    return None if v == '-' else v


def build_udid_uncovered():
    df = pd.read_excel(f'{DOWNLOADS}\\Mayiladuthurai_UDID_Uncovered_25.6.26.xlsx', sheet_name=0, header=0)
    records = []
    for _, row in df.iterrows():
        n = clean(row.get('Full Name'))
        if not n:
            continue
        r = {
            'src': 'udid_uncovered',
            'n': n,
            'father': clean(row.get('Father Name')),
            'dob': clean(row.get('Date of Birth')),
            'mob': mob_str(row.get('Applicant Mobile')),
            'addr': collapse_ws(row.get('Current Address')),
            'dist': na_dash(row.get('Current State Name')),
            'tal': na_dash(row.get('Current Subdistrict Name')),
            'vil': na_dash(row.get('Current Village Name')),
            'pin': mob_str(row.get('Current Pincode')),
            'udid': clean(row.get('UDID Number')),
        }
        records.append({k: v for k, v in r.items() if v is not None})
    return records


# ---------------------------------------------------------------------------
# Stats + output
# ---------------------------------------------------------------------------

def is_val(v):
    return v is not None and str(v).strip() not in ('', 'nan', 'NaT', 'None')


def count_field(records, key):
    counts = {}
    for r in records:
        v = r.get(key)
        if not is_val(v):
            continue
        counts[v] = counts.get(v, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: -x[1]))


def build_stats_module(records, geo_key=None):
    total = len(records)
    stats = {
        'total': total,
        'aadhaar': sum(1 for r in records if is_val(r.get('aadhar'))),
        'udid': sum(1 for r in records if is_val(r.get('udid'))),
        'nidc': sum(1 for r in records if is_val(r.get('nidc'))),
    }
    by_gender = count_field(records, 'g')
    if by_gender:
        stats['by_gender'] = by_gender
    by_dis = count_field(records, 'dis')
    if by_dis:
        stats['by_dis'] = by_dis
    if any(is_val(r.get('dpct')) for r in records):
        stats['by_dis_pct'] = count_field(records, 'dpct')
    if geo_key and any(is_val(r.get(geo_key)) for r in records):
        stats['by_geo'] = count_field(records, geo_key)
    return stats


def write_json(records, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False)
    print(f'Wrote {path} — {len(records)} records')


def write_stats_js(stats, var_name, path):
    js = 'const ' + var_name + ' = ' + json.dumps(stats, ensure_ascii=False, indent=2) + ';\nexport default ' + var_name + ';\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'Wrote {path}')


def main():
    mg = build_mg()
    write_json(mg, 'public/mg.json')
    write_stats_js(build_stats_module(mg, 'tal'), 'mgStats', 'src/data/mgStats.js')

    scholarship = build_scholarship()
    write_json(scholarship, 'public/scholarship.json')
    write_stats_js(build_stats_module(scholarship), 'scholarshipStats', 'src/data/scholarshipStats.js')

    bankloan = build_bankloan()
    write_json(bankloan, 'public/bankloan.json')
    write_stats_js(build_stats_module(bankloan), 'bankloanStats', 'src/data/bankloanStats.js')

    readers = build_readers()
    write_json(readers, 'public/readers.json')
    write_stats_js(build_stats_module(readers), 'readersStats', 'src/data/readersStats.js')

    udid_uncovered = build_udid_uncovered()
    write_json(udid_uncovered, 'public/udid_uncovered.json')
    write_stats_js(build_stats_module(udid_uncovered, 'tal'), 'udidUncoveredStats', 'src/data/udidUncoveredStats.js')


if __name__ == '__main__':
    main()
