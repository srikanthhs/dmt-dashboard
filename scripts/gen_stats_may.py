import sys, io, pandas as pd, math, json, re
from datetime import datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

xl = pd.ExcelFile(r'C:\Users\Admin\Downloads\Block Wise May Month Master data.xlsx')

def clean(v):
    if v is None or (isinstance(v, float) and math.isnan(v)): return None
    s = str(v).strip()
    return None if s in ('', 'nan', 'NaT', 'None') else s

def norm_block(b):
    if not b: return None
    u = b.upper().strip()
    if 'KUTHALAM' in u or 'KUTTALAM' in u: return 'Kuthalam'
    if 'SIRKAZHI' in u or 'SIRAZHI' in u or 'SIRKALI' in u: return 'Sirkali'
    if 'SEMBANARKOIL' in u or 'SEBMANARKOIL' in u or 'SEMBANAR' in u: return 'Sembanarkoil'
    if 'MAYILADUTHURAI' in u or u.startswith('MYD'): return 'Mayiladuthurai'
    if 'KOLLIDAM' in u: return 'Kollidam'
    return None

def norm_dis(d):
    if not d: return None
    u = d.upper()
    if 'LOCOMOTOR' in u or '/LOCOMOTOR' in u: return 'Locomotor Disability'
    if 'INTELLECTUAL' in u or u.strip() in ('MR', 'ID'): return 'Intellectual Disability'
    if 'HEARING' in u: return 'Hearing Impairment'
    if 'BLINDNESS' in u: return 'Blindness'
    if 'MULTIPLE DISABILITIES' in u or 'MULTIPLE DISAB' in u: return 'Multiple Disabilities'
    if 'MULTIPLE SCLEROSIS' in u: return 'Multiple Sclerosis'
    if 'MENTAL' in u: return 'Mental Illness'
    if 'LOW-VISION' in u or 'LOW VISION' in u: return 'Low Vision'
    if 'CEREBRAL' in u or u.strip() in ('CP', 'CP-MR', 'CP MR', 'CP MR', 'MD/CP'): return 'Cerebral Palsy'
    if 'LEPROSY' in u or u.strip() == 'LC': return 'Leprosy Cured'
    if 'MUSCULAR' in u: return 'Muscular Dystrophy'
    if 'DWARFISM' in u: return 'Dwarfism'
    if 'AUTISM' in u: return 'Autism Spectrum'
    if 'SPEECH' in u: return 'Speech & Language'
    if 'CHRONIC' in u or u.strip() == 'CNC': return 'Chronic Neurological'
    if 'HAEMOPHILIA' in u: return 'Haemophilia'
    if 'SICKLE' in u: return 'Sickle Cell'
    if 'ACID' in u: return 'Acid Attack'
    if 'SPECIFIC LEARNING' in u: return 'Specific Learning'
    if 'THALASSEMIA' in u: return 'Thalassemia'
    if 'PARKINSON' in u: return 'Parkinsons Disease'
    # Tamil-only fallback
    if 'கை' in d or 'கால்' in d: return 'Locomotor Disability'  # கை/கால்
    if 'அறிவு' in d: return 'Intellectual Disability'  # அறிவு
    if 'செவி' in d: return 'Hearing Impairment'  # செவி
    if 'கண்' in d and 'பார்வை' in d: return 'Blindness'  # கண் பார்வை
    if 'மனநோய்' in d: return 'Mental Illness'  # மனநோய்
    if 'பல்வகை' in d: return 'Multiple Disabilities'  # பல்வகை
    if 'மூளை' in d: return 'Cerebral Palsy'  # மூளை
    if 'தசை' in d: return 'Muscular Dystrophy'  # தசை
    if 'தொழு' in d or 'தொழுநோய்' in d: return 'Leprosy Cured'
    if u.strip() in ('MD', 'MR', 'MR '):  # catch-all short codes
        if u.strip() == 'MD': return 'Multiple Disabilities'
        if 'MR' in u.strip(): return 'Intellectual Disability'
    return None

def norm_edu(e):
    if not e: return None
    u = e.upper().strip()
    if 'ABOVE PG' in u: return 'Ph.D'
    if u == 'PG': return 'Post Graduate'
    if u == 'UG': return 'Under Graduate'
    if u == 'DIPLOMA': return 'Diploma'
    if '12' in u or '11TH' in u: return 'Upto 12th Std'
    if '10TH' in u or u == '10': return 'Upto 10th Std'
    if '6TH TO 9TH' in u or u in ('9TH', '8TH', '7TH', '6TH'): return 'Upto 8th Std'
    if 'UPTO 5TH' in u or u in ('5TH',): return 'Upto 5th Std'
    if u in ('NO', 'NO FORMAL', 'NO EDUCATION'): return 'No Formal Education'
    if u in ('NOT APPLICABLE', 'NA', 'N/A'): return 'Not Applicable'
    # Tamil: no school
    if 'பள்ளி' in e: return 'No Formal Education'
    return 'Others'

def norm_gender(g):
    if not g: return None
    u = g.upper().strip()
    if 'FEMALE' in u: return 'Female'
    if 'MALE' in u or u in ('M',): return 'Male'
    if 'TRANS' in u or 'MELA' in u: return 'Transgender'
    return None

def norm_caste(c):
    if not c: return None
    u = c.upper().strip()
    if u.startswith('SC'): return 'Scheduled Caste'
    if u.startswith('MBC'): return 'Most Backward Classes'
    if u.startswith('BC'): return 'Backward Classes'
    if u == 'OC': return 'Other Classes'
    if u == 'ST': return 'Scheduled Tribes'
    if u in ('NO', 'N/A', 'NONE'): return None
    return 'Other Classes'

def norm_age(dob_str):
    if not dob_str: return None
    try:
        for fmt in ('%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%d.%m.%Y', '%Y/%m/%d'):
            try:
                dt = datetime.strptime(str(dob_str).strip()[:10], fmt)
                age = (datetime(2026, 5, 1) - dt).days // 365
                if 0 <= age <= 110: return age
            except:
                pass
    except:
        pass
    return None

def parse_sheet(sheet_name):
    df = xl.parse(sheet_name)
    if df.shape[0] == 0: return []
    df.columns = [str(c).strip().upper() for c in df.columns]
    rows = []
    for _, row in df.iterrows():
        r = {}
        for nc in ['NAME OF DAP', 'NAME OF DAP MI']:
            if nc in df.columns:
                r['name'] = clean(row.get(nc)); break
        if not r.get('name'): continue
        for ac in ['DAP AADHAR NUMBER', 'DAP AADHAR NUMBER.1']:
            if ac in df.columns:
                v = clean(row.get(ac))
                if v and any(ch.isdigit() for ch in str(v)): r['aadhar'] = v; break
        if 'DISABILITY TYPE' in df.columns:
            r['dis_type'] = norm_dis(clean(row.get('DISABILITY TYPE')))
        if 'DISABILITY PERCENTAGE' in df.columns:
            r['dis_pct'] = clean(row.get('DISABILITY PERCENTAGE'))
        if 'GENDER' in df.columns:
            r['gender'] = norm_gender(clean(row.get('GENDER')))
        for nc in ['DAP NIDC NUMBER', 'NIDC NUMBER']:
            if nc in df.columns:
                v = clean(row.get(nc))
                if v: r['nidc'] = v; break
        if 'UDID NUMBER' in df.columns:
            v = clean(row.get('UDID NUMBER'))
            if v: r['udid'] = v
        if 'BLOCK' in df.columns:
            r['block'] = norm_block(clean(row.get('BLOCK')))
        for ec in ['DAP EDUCATION QUALIFICATION', 'EDUCATIONAL QUALIFICATION']:
            if ec in df.columns: r['edu'] = norm_edu(clean(row.get(ec))); break
        if 'CASTE' in df.columns:
            r['caste'] = norm_caste(clean(row.get('CASTE')))
        if 'DATE OF BIRTH' in df.columns:
            r['age'] = norm_age(clean(row.get('DATE OF BIRTH')))
        if 'VOTER ID NUMBER' in df.columns:
            v = clean(row.get('VOTER ID NUMBER'))
            if v: r['voter_id'] = v
        if 'RURAL' in sheet_name.upper(): r['area'] = 'Rural'
        elif 'URBAN' in sheet_name.upper(): r['area'] = 'Urban'
        else: r['area'] = 'Rural'
        rows.append(r)
    return rows

all_rows = []
for sheet in xl.sheet_names:
    all_rows.extend(parse_sheet(sheet))

total = len(all_rows)
print(f'Total: {total}')

def count_field(rows, key, norm=None):
    counts = {}
    for r in rows:
        v = r.get(key)
        if norm: v = norm(v)
        if v: counts[v] = counts.get(v, 0) + 1
    return dict(sorted(counts.items(), key=lambda x: -x[1]))

blocks_raw = count_field(all_rows, 'block')
print('Blocks:', blocks_raw)

gender = count_field(all_rows, 'gender')
dis_types = count_field(all_rows, 'dis_type')
caste = count_field(all_rows, 'caste')
edu = count_field(all_rows, 'edu')
area = count_field(all_rows, 'area')

udid_holders = sum(1 for r in all_rows if r.get('udid'))
nidc_holders = sum(1 for r in all_rows if r.get('nidc'))
aadhaar_linked = sum(1 for r in all_rows if r.get('aadhar'))
voter_id = sum(1 for r in all_rows if r.get('voter_id'))

print(f'UDID:{udid_holders} NIDC:{nidc_holders} Aadhaar:{aadhaar_linked}')
print('Gender:', gender)
print('Area:', area)
print('Edu:', edu)
print('Caste:', caste)
print('DisTypes:', {k:v for k,v in list(dis_types.items())[:10]})

# Age groups from DOB
ages = [r['age'] for r in all_rows if r.get('age')]
print(f'Age data: {len(ages)} records, min={min(ages) if ages else "?"}, max={max(ages) if ages else "?"}')
age_groups = {'0-10':0,'11-20':0,'21-30':0,'31-40':0,'41-50':0,'51-60':0,'61-70':0,'71-80':0,'80+':0}
for a in ages:
    if a <= 10: age_groups['0-10'] += 1
    elif a <= 20: age_groups['11-20'] += 1
    elif a <= 30: age_groups['21-30'] += 1
    elif a <= 40: age_groups['31-40'] += 1
    elif a <= 50: age_groups['41-50'] += 1
    elif a <= 60: age_groups['51-60'] += 1
    elif a <= 70: age_groups['61-70'] += 1
    elif a <= 80: age_groups['71-80'] += 1
    else: age_groups['80+'] += 1
print('AgeGroups:', age_groups)

# Block-disability breakdown
block_dis = {}
for r in all_rows:
    b = r.get('block')
    d = r.get('dis_type')
    if b and d:
        if b not in block_dis: block_dis[b] = {}
        block_dis[b][d] = block_dis[b].get(d, 0) + 1

# Keep top 5 disability types per block
TOP5_DIS = [k for k,_ in list(dis_types.items())[:5]]
block_dis_clean = {}
for b, dis in block_dis.items():
    block_dis_clean[b] = {k: dis.get(k, 0) for k in TOP5_DIS}
print('BlockDis (Kuthalam):', block_dis_clean.get('Kuthalam'))

print('\n=== STATS READY ===')
print(json.dumps({
    'total': total,
    'udid_holders': udid_holders,
    'nidc_holders': nidc_holders,
    'aadhaar_linked': aadhaar_linked,
    'gender': gender,
    'blocks': blocks_raw,
    'dis_types': dis_types,
    'caste': caste,
    'edu': edu,
    'area': area,
    'age_groups': age_groups,
    'block_dis_clean': block_dis_clean,
    'top5_dis': TOP5_DIS,
}, ensure_ascii=False, indent=2))
