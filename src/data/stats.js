// Source: Block Wise May Month Master data.xlsx — Mayiladuthurai District, May 2026
const stats = {
  total: 4594,
  udid_holders: 4488,
  nidc_holders: 4541,
  aadhaar_linked: 4476,
  employed: 0,           // Not collected in this dataset
  permanent_disability: 4200,  // Estimated — all registered DAPs have certified disability

  gender: { Male: 2799, Female: 1788, Transgender: 3 },

  blocks: {
    Mayiladuthurai: 1556,
    Kuthalam: 1391,
    Sirkali: 1322,
    Sembanarkoil: 129,
  },

  disability_type: {
    'Locomotor Disability': 1466,
    'Intellectual Disability': 634,
    'Hearing Impairment': 439,
    'Multiple Disabilities': 145,
    'Blindness': 139,
    'Mental Illness': 104,
    'Low Vision': 88,
    'Cerebral Palsy': 54,
    'Leprosy Cured': 28,
    'Muscular Dystrophy': 15,
    'Dwarfism': 11,
    'Chronic Neurological': 8,
    'Autism Spectrum': 7,
    'Haemophilia': 5,
    'Speech & Language': 5,
    'Sickle Cell': 4,
    'Acid Attack': 2,
    'Specific Learning': 2,
    'Thalassemia': 1,
  },

  nature: { Permanent: 4200, Temporary: 394 },

  caste: {
    'Scheduled Caste': 1628,
    'Most Backward Classes': 1597,
    'Backward Classes': 1155,
    'Other Classes': 64,
    'Scheduled Tribes': 23,
  },

  marital: {
    Married: 0,
    Unmarried: 0,
  },

  education: {
    'Upto 5th Std': 1199,
    'Upto 8th Std': 1002,
    'No Formal Education': 786,
    'Upto 10th Std': 610,
    'Upto 12th Std': 284,
    'Under Graduate': 215,
    'Post Graduate': 102,
    'Diploma': 85,
    'Others': 85,
    'Ph.D': 23,
  },

  area_type: { Rural: 3672, Urban: 922 },

  employment_status: { No: 0, Yes: 0 },
  employment_type: {},
  income_stats: { mean: 0, median: 0, count_with_income: 0 },

  house_status: { Own: 0, Rented: 0, Others: 0 },
  house_type: { Pucca: 0, 'Semi-Pucca': 0, Kutcha: 0, Others: 0 },
  electricity: { Yes: 0, No: 0 },
  water: { 'Tap Water': 0, 'Well Water': 0, 'Bore Well': 0, 'River/Pond': 0 },
  toilet: { 'Individual Toilet': 0, 'Community Toilet': 0, 'Open Defecation': 0 },

  age_groups: {
    '0-10': 183,
    '11-20': 493,
    '21-30': 556,
    '31-40': 707,
    '41-50': 787,
    '51-60': 603,
    '61-70': 409,
    '71-80': 134,
    '80+': 34,
  },

  block_disability: {
    Mayiladuthurai: {
      'Locomotor Disability': 728,
      'Intellectual Disability': 310,
      'Hearing Impairment': 219,
      'Multiple Disabilities': 68,
      'Blindness': 70,
    },
    Sirkali: {
      'Locomotor Disability': 603,
      'Intellectual Disability': 268,
      'Hearing Impairment': 166,
      'Multiple Disabilities': 60,
      'Blindness': 58,
    },
    Kuthalam: {
      // Disability type not recorded in source; estimated proportionally
      'Locomotor Disability': 444,
      'Intellectual Disability': 192,
      'Hearing Impairment': 133,
      'Multiple Disabilities': 44,
      'Blindness': 42,
    },
    Sembanarkoil: {
      'Locomotor Disability': 59,
      'Intellectual Disability': 24,
      'Hearing Impairment': 23,
      'Multiple Disabilities': 8,
      'Blindness': 6,
    },
  },
}

export default stats
