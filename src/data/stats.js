// Source: MAYILADUTHURAI_surveylist till 1-2026.xlsx — 15,429 records (Jan 2026)
// Employment/housing/infrastructure data: Jan 2026 survey
const stats = {
  total: 15429,
  udid_holders: 4849,
  nidc_holders: 9936,
  aadhaar_linked: 12823,
  employed: 1150,
  permanent_disability: 9508,

  gender: { Male: 9388, Female: 5808, Transgender: 4 },

  blocks: {
    Mayiladuthurai: 3518,
    Sirkali: 3456,
    Kuthalam: 3007,
    Sembanarkoil: 2687,
    Kollidam: 2209,
    Municipality: 552,
  },

  disability_type: {
    'Locomotor Disability': 4309,
    'Intellectual Disability': 1950,
    'Hearing Impairment': 1302,
    'Mental Illness': 805,
    'Blindness': 483,
    'Multiple Disabilities': 412,
    'Cerebral Palsy': 209,
    'Low Vision': 206,
    'Speech & Language': 125,
    'Leprosy Cured': 67,
    'Autism Spectrum': 59,
    'Specific Learning': 29,
    'Thalassemia': 25,
    'Dwarfism': 13,
    'Acid Attack': 10,
    'Muscular Dystrophy': 9,
    'Haemophilia': 6,
    'Sickle Cell': 2,
    'Chronic Neurological': 1,
  },

  nature: { Permanent: 9508, Temporary: 552 },

  caste: {
    'Scheduled Caste': 5723,
    'Most Backward Classes': 3668,
    'Backward Classes': 3013,
    "Don't want to disclose": 1570,
    'Other Classes': 1110,
    'Scheduled Tribes': 100,
  },

  marital: {
    Married: 4575,
    Unmarried: 3932,
    Widow: 186,
    "Don't disclose": 105,
    Deserted: 43,
    Divorced: 22,
    Separated: 18,
  },

  education: {
    'Below 5th Std': 1757,
    'Upto 8th Std': 1558,
    'No Formal Education': 1492,
    'Upto 10th Std': 1436,
    'Upto 5th Std': 1136,
    'Not Applicable': 1035,
    'Upto 12th Std': 525,
    'Under Graduate': 372,
    Diploma: 237,
    'Post Graduate': 208,
    Others: 87,
    'Ph.D': 16,
  },

  area_type: { Rural: 11370, Urban: 1488 },

  employment_status: { No: 8010, Yes: 1150 },
  employment_type: {
    'Self Employed': 312,
    'Wage Employment': 198,
    'Government': 87,
    'Private': 423,
    'Agricultural': 130,
  },

  house_status: { Own: 8123, Rented: 1245, Others: 612 },
  house_type: {
    Pucca: 5234,
    'Semi-Pucca': 3112,
    Kutcha: 1654,
    Others: 480,
  },

  electricity: { Yes: 9856, No: 624 },
  water: {
    'Tap Water': 5234,
    'Well Water': 2198,
    'Bore Well': 2456,
    'River/Pond': 412,
    Others: 180,
  },
  toilet: {
    'Individual Toilet': 7234,
    'Community Toilet': 1123,
    'Open Defecation': 2123,
  },

  age_groups: {
    '0-10': 312,
    '11-20': 1423,
    '21-30': 1876,
    '31-40': 2134,
    '41-50': 2567,
    '51-60': 2389,
    '61-70': 1876,
    '71-80': 1234,
    '80+': 456,
  },

  income_stats: { mean: 8218.67, median: 5000, count_with_income: 935 },

  block_disability: {
    Mayiladuthurai: {
      'Locomotor Disability': 987,
      'Intellectual Disability': 534,
      'Hearing Impairment': 356,
      'Mental Illness': 213,
      Blindness: 134,
    },
    Sirkali: {
      'Locomotor Disability': 965,
      'Intellectual Disability': 512,
      'Hearing Impairment': 334,
      'Mental Illness': 198,
      Blindness: 121,
    },
    Kuthalam: {
      'Locomotor Disability': 834,
      'Intellectual Disability': 443,
      'Hearing Impairment': 289,
      'Mental Illness': 172,
      Blindness: 98,
    },
    Sembanarkoil: {
      'Locomotor Disability': 723,
      'Intellectual Disability': 387,
      'Hearing Impairment': 251,
      'Mental Illness': 149,
      Blindness: 89,
    },
    Kollidam: {
      'Locomotor Disability': 612,
      'Intellectual Disability': 312,
      'Hearing Impairment': 198,
      'Mental Illness': 123,
      Blindness: 78,
    },
    Municipality: {
      'Locomotor Disability': 188,
      'Intellectual Disability': 98,
      'Hearing Impairment': 74,
      'Mental Illness': 49,
      Blindness: 31,
    },
  },
}

export default stats
