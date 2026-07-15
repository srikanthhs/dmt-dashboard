"""Shared normalization helpers for building public/*.json datasets from raw Excel exports."""
import math
from datetime import datetime


def clean(v):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return None
    s = str(v).strip()
    s = s.replace('\n', '').replace('\r', '')
    return None if s in ('', 'nan', 'NaT', 'None') else s


def norm_block(b):
    if not b:
        return None
    u = b.upper().strip()
    if 'KUTHALAM' in u or 'KUTTALAM' in u:
        return 'Kuthalam'
    if 'SIRKAZHI' in u or 'SIRAZHI' in u or 'SIRKALI' in u:
        return 'Sirkali'
    if 'SEMBANARKOIL' in u or 'SEBMANARKOIL' in u or 'SEMBANAR' in u:
        return 'Sembanarkoil'
    if 'MAYILADUTHURAI' in u or u.startswith('MYD'):
        return 'Mayiladuthurai'
    if 'KOLLIDAM' in u:
        return 'Kollidam'
    return None


def norm_dis(d):
    if not d:
        return None
    u = d.upper()
    if 'LOCOMOTOR' in u or '/LOCOMOTOR' in u:
        return 'Locomotor Disability'
    if 'INTELLECTUAL' in u or u.strip() in ('MR', 'ID'):
        return 'Intellectual Disability'
    if 'HEARING' in u:
        return 'Hearing Impairment'
    if 'BLINDNESS' in u:
        return 'Blindness'
    if 'MULTIPLE DISABILITIES' in u or 'MULTIPLE DISAB' in u:
        return 'Multiple Disabilities'
    if 'MULTIPLE SCLEROSIS' in u:
        return 'Multiple Sclerosis'
    if 'MENTAL' in u:
        return 'Mental Illness'
    if 'LOW-VISION' in u or 'LOW VISION' in u:
        return 'Low Vision'
    if 'CEREBRAL' in u or u.strip() in ('CP', 'CP-MR', 'CP MR', 'MD/CP'):
        return 'Cerebral Palsy'
    if 'LEPROSY' in u or u.strip() == 'LC':
        return 'Leprosy Cured'
    if 'MUSCULAR' in u:
        return 'Muscular Dystrophy'
    if 'DWARFISM' in u:
        return 'Dwarfism'
    if 'AUTISM' in u:
        return 'Autism Spectrum'
    if 'SPEECH' in u:
        return 'Speech & Language'
    if 'CHRONIC' in u or u.strip() == 'CNC':
        return 'Chronic Neurological'
    if 'HAEMOPHILIA' in u:
        return 'Haemophilia'
    if 'SICKLE' in u:
        return 'Sickle Cell'
    if 'ACID' in u:
        return 'Acid Attack'
    if 'SPECIFIC LEARNING' in u:
        return 'Specific Learning'
    if 'THALASSEMIA' in u:
        return 'Thalassemia'
    if 'PARKINSON' in u:
        return 'Parkinsons Disease'
    if 'SEVERE DISAB' in u or u.strip() == 'SD':
        return 'Multiple Disabilities'
    if 'கை' in d or 'கால்' in d:
        return 'Locomotor Disability'
    if 'அறிவு' in d:
        return 'Intellectual Disability'
    if 'செவி' in d:
        return 'Hearing Impairment'
    if 'கண்' in d and 'பார்வை' in d:
        return 'Blindness'
    if 'மனநோய்' in d:
        return 'Mental Illness'
    if 'பல்வகை' in d:
        return 'Multiple Disabilities'
    if 'மூளை' in d:
        return 'Cerebral Palsy'
    if 'தசை' in d:
        return 'Muscular Dystrophy'
    if 'தொழு' in d or 'தொழுநோய்' in d:
        return 'Leprosy Cured'
    if u.strip() == 'MD':
        return 'Multiple Disabilities'
    if u.strip() in ('MR',):
        return 'Intellectual Disability'
    return None


# Short disability codes used in the scholarship/bankloan/readers-allowance sheets
# (distinct code space from norm_dis's full-word matching above).
DIS_CODE_MAP = {
    'ID': 'Intellectual Disability',
    'MR': 'Intellectual Disability',
    'MUD': 'Multiple Disabilities',
    'MD': 'Multiple Disabilities',
    'CP': 'Cerebral Palsy',
    'VI': 'Blindness',
    'LV': 'Low Vision',
    'LD': 'Locomotor Disability',
    'HI': 'Hearing Impairment',
    'HH': 'Hearing Impairment',
    'SLD': 'Specific Learning',
    'AUT': 'Autism Spectrum',
    'MI': 'Mental Illness',
    'DF': 'Dwarfism',
    'LC': 'Leprosy Cured',
    'ANK': 'Acid Attack',
    'MS': 'Multiple Sclerosis',
    'SCD': 'Sickle Cell',
    'TH': 'Thalassemia',
    'HAE': 'Haemophilia',
    'PD': 'Parkinsons Disease',
    'CNC': 'Chronic Neurological',
    'SD': 'Multiple Disabilities',
    'SPL': 'Speech & Language',
}


def norm_dis_code(code):
    if not code:
        return None
    u = str(code).strip().upper()
    if u in DIS_CODE_MAP:
        return DIS_CODE_MAP[u]
    return norm_dis(code)


def norm_edu(e):
    if not e:
        return None
    u = e.upper().strip()
    if 'ABOVE PG' in u:
        return 'Ph.D'
    if u == 'PG':
        return 'Post Graduate'
    if u == 'UG':
        return 'Under Graduate'
    if u == 'DIPLOMA':
        return 'Diploma'
    if '12' in u or '11TH' in u:
        return 'Upto 12th Std'
    if '10TH' in u or u == '10':
        return 'Upto 10th Std'
    if '6TH TO 9TH' in u or u in ('9TH', '8TH', '7TH', '6TH'):
        return 'Upto 8th Std'
    if 'UPTO 5TH' in u or u in ('5TH',):
        return 'Upto 5th Std'
    if u in ('NO', 'NO FORMAL', 'NO EDUCATION'):
        return 'No Formal Education'
    if u in ('NOT APPLICABLE', 'NA', 'N/A'):
        return 'Not Applicable'
    if 'பள்ளி' in e:
        return 'No Formal Education'
    return 'Others'


def norm_gender(g):
    if not g:
        return None
    u = g.upper().strip()
    if 'FEMALE' in u or u == 'F':
        return 'Female'
    if 'MALE' in u or u in ('M',):
        return 'Male'
    if 'TRANS' in u or 'MELA' in u:
        return 'Transgender'
    return None


def norm_caste(c):
    if not c:
        return None
    u = c.upper().strip()
    if u.startswith('SC'):
        return 'Scheduled Caste'
    if u.startswith('MBC'):
        return 'Most Backward Classes'
    if u.startswith('BC'):
        return 'Backward Classes'
    if u == 'OC':
        return 'Other Classes'
    if u == 'ST':
        return 'Scheduled Tribes'
    if u in ('NO', 'N/A', 'NONE'):
        return None
    return 'Other Classes'


def norm_age(dob_str, ref_year=2026, ref_month=7):
    if not dob_str:
        return None
    try:
        for fmt in ('%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y', '%m/%d/%Y', '%d.%m.%Y', '%Y/%m/%d'):
            try:
                dt = datetime.strptime(str(dob_str).strip()[:10], fmt)
                age = (datetime(ref_year, ref_month, 1) - dt).days // 365
                if 0 <= age <= 110:
                    return age
            except Exception:
                pass
    except Exception:
        pass
    return None


# Exact-match cleanup maps for the raw values actually stored in
# public/beneficiaries.json (mix of "Name (CODE)" and bare "Name" strings,
# plus a few malformed "CODE)" fragments from the original source data).
BENEFICIARY_DIS_MAP = {
    'Locomotor Disability (LD)': 'Locomotor Disability',
    'Locomotor Disability': 'Locomotor Disability',
    'MR)': 'Intellectual Disability',
    'Intellectual Disability': 'Intellectual Disability',
    'HH)': 'Hearing Impairment',
    'Hearing Impairment': 'Hearing Impairment',
    'Blindness (VI)': 'Blindness',
    'Blindness': 'Blindness',
    'Multiple Disabilities (MD)': 'Multiple Disabilities',
    'Multiple Disabilities': 'Multiple Disabilities',
    'Mental Illness (MI)': 'Mental Illness',
    'Mental Illness': 'Mental Illness',
    'Low Vision (LV)': 'Low Vision',
    'Low Vision': 'Low Vision',
    'Cerebral Palsy (CP)': 'Cerebral Palsy',
    'Cerebral Palsy': 'Cerebral Palsy',
    'Speech and Language disability (SpLaD)': 'Speech & Language',
    'Speech & Language': 'Speech & Language',
    'Leprosy Cured Persons (LC)': 'Leprosy Cured',
    'Leprosy Cured': 'Leprosy Cured',
    'Dwarfism (DF)': 'Dwarfism',
    'Dwarfism': 'Dwarfism',
    'Muscular Dystrophy (MUD)': 'Muscular Dystrophy',
    'Muscular Dystrophy': 'Muscular Dystrophy',
    'Chronic Neurological conditions (CNC)': 'Chronic Neurological',
    'Chronic Neurological': 'Chronic Neurological',
    'Acid Attack Victims (AC)': 'Acid Attack',
    'Autism Spectrum Disorder (ASD)': 'Autism Spectrum',
    'Hemophilia (HE)': 'Haemophilia',
    'Parkinsons Disease (PD)': 'Parkinsons Disease',
    'Parkinsons Disease': 'Parkinsons Disease',
    'Thalassemia (TH)': 'Thalassemia',
    'Specific Learning Disabilities (SLD)': 'Specific Learning',
    'Specific Learning': 'Specific Learning',
    'Sickle cell disease (SCD)': 'Sickle Cell',
}

BENEFICIARY_CASTE_MAP = {
    'Most Backward Classes or Denotified Communities': 'Most Backward Classes',
}

BENEFICIARY_EDU_MAP = {
    'Upto 8th std': 'Upto 8th Std',
    'No Formal education': 'No Formal Education',
    'Upto 10th std': 'Upto 10th Std',
    'Upto 5th std': 'Upto 5th Std',
    'Upto 12th std': 'Upto 12th Std',
    'Diploma certificate': 'Diploma',
}

BENEFICIARY_HSTAT_MAP = {'Rent': 'Rented'}
BENEFICIARY_HTYPE_MAP = {'Concrete': 'Pucca', 'Thatched': 'Kutcha', 'Tiled': 'Semi-Pucca'}
BENEFICIARY_WATER_MAP = {
    'Tap water inside the house': 'Tap Water',
    'Common community Tap or Well': 'Well Water',
    'Canned water': 'Others',
    'Not Applicable': 'Others',
}
BENEFICIARY_TOILET_MAP = {
    'Own': 'Individual Toilet',
    'Not Available': 'Open Defecation',
    'Public': 'Community Toilet',
}
BENEFICIARY_ETYPE_MAP = {
    'Daily Wage Labour': 'Wage Employment',
    'Self employed': 'Self Employed',
    'Government Permanent': 'Government',
    'Government Contractual': 'Government',
    'Agriculture': 'Agricultural',
    'Unpaid family work': 'Unpaid',
}


def first_number(s):
    """Pull the first contiguous digit-run out of a cell that may hold multiple numbers."""
    if not s:
        return None
    s = str(s)
    digits = ''
    started = False
    for ch in s:
        if ch.isdigit():
            digits += ch
            started = True
        elif started:
            break
    return digits or None
