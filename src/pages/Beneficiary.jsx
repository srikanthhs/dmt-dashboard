import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search, X, User, MapPin, FileText, Heart, Home,
  Briefcase, GraduationCap, ChevronRight, AlertCircle,
  Clock, Bike, Gift, CheckCircle, XCircle, Filter,
  HeartHandshake, Award, Landmark, BookOpen, ShieldAlert
} from 'lucide-react'
import TopBar from '../components/TopBar'

let cachedSurvey = null
let cachedScooty = null
let cachedMg = null
let cachedScholarship = null
let cachedBankloan = null
let cachedReaders = null
let cachedUdidUncovered = null
let scootyIdx = null
let surveyIdx = null
let mgIdx = null
let scholarshipIdx = null
let bankloanIdx = null
let readersIdx = null
let udidUncoveredIdx = null

function cachedFetch(url, getCache, setCache) {
  const c = getCache()
  if (c) return Promise.resolve(c)
  return fetch(url).then(r => r.json()).then(d => { setCache(d); return d })
}

const FIELD_MAP = {
  n: 'Name', dob: 'Date of Birth', age: 'Age', g: 'Gender', mob: 'Mobile',
  blk: 'Block', pds: 'PDS Number', nidc: 'NIDC Number', udid: 'UDID Number',
  vid: 'Voter ID', rc: 'Ration Card', aad: 'Aadhaar Status',
  dis: 'Disability Type', dpct: 'Disability %', nat: 'Nature',
  dreason: 'Reason', caste: 'Caste', mar: 'Marital Status', edu: 'Education',
  emp: 'Employed', etype: 'Employment Type', inc: 'Monthly Income (₹)',
  hstat: 'House Ownership', htype: 'House Type', elec: 'Electricity',
  water: 'Water Source', toilet: 'Toilet Facility', fam: 'Family Members',
  area: 'Area Type', vil: 'Village', tal: 'Taluk', pin: 'Pincode',
  door: 'Door No', str: 'Street', stat: 'Status', dap: 'DAP Name', pcare: 'Primary Care',
  aadhar: 'Aadhaar No', veh: 'Vehicle No', rto: 'RTO', fy: 'Financial Year',
  leg: 'Leg Type', stype: 'Scooter Type', fund: 'Fund Type', mla: 'MLA Constituency',
  addr: 'Address', dist: 'District', father: 'Father Name', acc: 'A/C Number',
  ifsc: 'IFSC', bank: 'Bank', cls: 'Class', amt: 'Amount', app_no: 'Application No',
  app_date: 'Application Date', branch: 'Branch', business: 'Business',
  loan_amt: 'Loan Amount', subsidy_amt: 'Subsidy Amount',
}

const SECTIONS = [
  { label: 'Personal Information', icon: User, color: '#1a73e8', fields: ['n','dob','age','g','mar','caste','mob','father'] },
  { label: 'Disability Details', icon: Heart, color: '#ea4335', fields: ['dis','dpct','nat','dreason','pcare'] },
  { label: 'Documents & IDs', icon: FileText, color: '#34a853', fields: ['aad','aadhar','nidc','udid','vid','rc','pds','stat'] },
  { label: 'Livelihood', icon: Briefcase, color: '#9334e6', fields: ['emp','etype','inc'] },
  { label: 'Education', icon: GraduationCap, color: '#fbbc04', fields: ['edu'] },
  { label: 'Infrastructure', icon: Home, color: '#00acc1', fields: ['hstat','htype','elec','water','toilet','fam'] },
  { label: 'Address', icon: MapPin, color: '#ff7043', fields: ['door','str','vil','blk','tal','dist','pin','area','addr'] },
]

const SRC_META = {
  scooty: { color: '#1a73e8' },
  mg: { color: '#9334e6' },
  scholarship: { color: '#1967d2' },
  bankloan: { color: '#34a853' },
  readers: { color: '#00acc1' },
  udid_uncovered: { color: '#f9a825' },
  survey: { color: '#34a853' },
}

function buildIndex(records, keys) {
  const idx = {}
  keys.forEach(k => { idx[k] = {} })
  for (const r of records) {
    for (const k of keys) {
      const v = r[k] ? String(r[k]).trim().toLowerCase() : null
      if (v && v !== 'nan') {
        if (!idx[k][v]) idx[k][v] = []
        idx[k][v].push(r)
      }
    }
  }
  return idx
}

function crossReference(person, sourceIdx) {
  const matches = new Set()
  const keys = [
    ['udid', person.udid],
    ['nidc', person.nidc],
    ['mob', person.mob],
    ['aadhar', person.aadhar],
  ]
  for (const [k, v] of keys) {
    if (!v || !sourceIdx?.[k]) continue
    const norm = String(v).trim().toLowerCase()
    const found = sourceIdx[k][norm] || []
    found.forEach(r => matches.add(r))
  }
  return Array.from(matches)
}

function applyFilter(records, params) {
  return records.filter(r => {
    if (params.blk && r.blk !== params.blk) return false
    if (params.vil && r.vil !== params.vil) return false
    if (params.g && r.g !== params.g) return false
    if (params.udid === 'yes' && (!r.udid || String(r.udid) === 'nan')) return false
    if (params.udid === 'no' && r.udid && String(r.udid) !== 'nan') return false
    if (params.nidc === 'yes' && (!r.nidc || String(r.nidc) === 'nan')) return false
    if (params.nidc === 'no' && r.nidc && String(r.nidc) !== 'nan') return false
    if (params.aad === 'yes' && r.aad !== 'Aadhaar Available') return false
    if (params.aad === 'no' && r.aad === 'Aadhaar Available') return false
    if (params.emp === 'yes' && r.emp !== 'Yes') return false
    if (params.emp === 'no' && r.emp !== 'No') return false
    if (params.nat && r.nat !== params.nat) return false
    if (params.dis && !r.dis?.toLowerCase().includes(params.dis.toLowerCase())) return false
    if (params.caste && r.caste !== params.caste) return false
    if (params.hstat && r.hstat !== params.hstat) return false
    if (params.htype && r.htype !== params.htype) return false
    if (params.elec && r.elec !== params.elec) return false
    if (params.water && r.water !== params.water) return false
    if (params.toilet && r.toilet !== params.toilet) return false
    if (params.edu && r.edu?.toLowerCase() !== params.edu.toLowerCase()) return false
    if (params.etype && !r.etype?.toLowerCase().includes(params.etype.toLowerCase())) return false
    if (params.mar && r.mar !== params.mar) return false
    if (params.area && r.area !== params.area) return false
    return true
  })
}

function getFilterLabel(params) {
  const labels = {
    blk:    v => `Block: ${v}`,
    vil:    v => `Village / Panchayat: ${v}`,
    g:      v => `Gender: ${v}`,
    udid:   v => v === 'yes' ? 'With UDID Card' : 'Without UDID Card',
    nidc:   v => v === 'yes' ? 'With NIDC Card' : 'Without NIDC Card',
    aad:    v => v === 'yes' ? 'Aadhaar Linked' : 'Aadhaar Not Linked',
    emp:    v => v === 'yes' ? 'Currently Employed' : 'Currently Unemployed',
    nat:    v => `${v} Disability`,
    dis:    v => `Disability: ${v}`,
    caste:  v => `Caste: ${v}`,
    hstat:  v => `House Ownership: ${v}`,
    htype:  v => `House Type: ${v}`,
    elec:   v => `Electricity: ${v}`,
    water:  v => `Water Source: ${v}`,
    toilet: v => `Toilet: ${v}`,
    edu:    v => `Education: ${v}`,
    etype:  v => `Employment Type: ${v}`,
    mar:    v => `Marital Status: ${v}`,
    area:   v => `Area: ${v}`,
  }
  return Object.entries(params).map(([k, v]) => labels[k]?.(v) || `${k}: ${v}`).join(' · ')
}

function scootyBenefit(r) {
  return {
    scheme: 'Scooty Scheme', icon: Bike, color: '#1a73e8', status: 'received',
    details: [
      { label: 'Vehicle No', value: r.veh || '—' },
      { label: 'Financial Year', value: r.fy || '—' },
      { label: 'RTO', value: r.rto || '—' },
      { label: 'Leg Type', value: r.leg || '—' },
      { label: 'Scooter Type', value: r.stype || '—' },
      { label: 'Fund Type', value: r.fund || '—' },
      { label: 'MLA Constituency', value: r.mla || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function surveyBenefit(r) {
  return {
    scheme: 'DAP Survey Registration', icon: FileText, color: '#34a853', status: 'registered',
    details: [
      { label: 'Block', value: r.blk || '—' },
      { label: 'Village', value: r.vil || '—' },
      { label: 'Status', value: r.stat || '—' },
      { label: 'Employed', value: r.emp || '—' },
      { label: 'Monthly Income', value: r.inc ? `₹${r.inc}` : '—' },
      { label: 'UDID Status', value: r.udid ? 'Issued' : 'Not Issued' },
      { label: 'NIDC Status', value: r.nidc ? 'Issued' : 'Not Issued' },
      { label: 'Aadhaar', value: r.aad || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function mgBenefit(r) {
  return {
    scheme: 'Maintenance Grant', icon: HeartHandshake, color: '#9334e6', status: 'received',
    details: [
      { label: 'District', value: r.dist || '—' },
      { label: 'Taluk', value: r.tal || '—' },
      { label: 'Disability Type', value: r.dis || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function scholarshipBenefit(r) {
  return {
    scheme: 'Scholarship', icon: Award, color: '#1967d2', status: 'received',
    details: [
      { label: 'Class', value: r.cls || '—' },
      { label: 'Amount', value: r.amt ? `₹${r.amt}` : '—' },
      { label: 'Bank', value: r.bank || '—' },
      { label: 'A/C Number', value: r.acc || '—' },
      { label: 'IFSC', value: r.ifsc || '—' },
      { label: 'Application No', value: r.app_no || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function bankloanBenefit(r) {
  return {
    scheme: 'Bank Loan Subsidy', icon: Landmark, color: '#34a853', status: 'received',
    details: [
      { label: 'Business', value: r.business || '—' },
      { label: 'Bank', value: r.bank || '—' },
      { label: 'Branch', value: r.branch || '—' },
      { label: 'Loan Amount', value: r.loan_amt ? `₹${r.loan_amt}` : '—' },
      { label: 'Subsidy Amount', value: r.subsidy_amt ? `₹${r.subsidy_amt}` : '—' },
      { label: 'Application No', value: r.app_no || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function readersBenefit(r) {
  return {
    scheme: 'Readers Allowance', icon: BookOpen, color: '#00acc1', status: 'received',
    details: [
      { label: 'Class', value: r.cls || '—' },
      { label: 'Amount', value: r.amt ? `₹${r.amt}` : '—' },
      { label: 'Bank', value: r.bank || '—' },
      { label: 'Ration Card', value: r.rc || '—' },
      { label: 'Application No', value: r.app_no || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

function udidUncoveredBenefit(r) {
  return {
    scheme: 'UDID Not Covered', icon: ShieldAlert, color: '#f9a825', status: 'warning',
    details: [
      { label: 'Taluk', value: r.tal || '—' },
      { label: 'Village', value: r.vil || '—' },
      { label: 'UDID Number', value: r.udid || '—' },
    ].filter(d => d.value && d.value !== '—'),
  }
}

const OWN_BENEFIT_BUILDERS = {
  scooty: scootyBenefit, mg: mgBenefit, scholarship: scholarshipBenefit,
  bankloan: bankloanBenefit, readers: readersBenefit, udid_uncovered: udidUncoveredBenefit,
}

function getBenefits(person) {
  const benefits = []
  const src = person.src

  if (src && OWN_BENEFIT_BUILDERS[src]) {
    benefits.push(OWN_BENEFIT_BUILDERS[src](person))
  }

  if (!src) {
    benefits.push(surveyBenefit(person))
  } else {
    const surveyMatches = crossReference(person, surveyIdx)
    if (surveyMatches.length > 0) benefits.push(surveyBenefit(surveyMatches[0]))
  }

  const crossIdxs = [
    ['scooty', scootyIdx, scootyBenefit],
    ['mg', mgIdx, mgBenefit],
    ['scholarship', scholarshipIdx, scholarshipBenefit],
    ['bankloan', bankloanIdx, bankloanBenefit],
    ['readers', readersIdx, readersBenefit],
    ['udid_uncovered', udidUncoveredIdx, udidUncoveredBenefit],
  ]
  for (const [key, idx, builder] of crossIdxs) {
    if (src === key) continue
    const matches = crossReference(person, idx)
    matches.forEach(m => benefits.push(builder(m)))
  }
  return benefits
}

function Badge({ value }) {
  if (!value) return <span style={{ color: '#9aa0a6', fontSize: 13 }}>—</span>
  const isGood = v => ['Yes', 'Aadhaar Available', 'Own', 'Permanent', 'Issued'].includes(v)
  const isWarn = v => ['No', 'Aadhaar Blank', 'Rented', 'Temporary', 'Not Issued'].includes(v)
  const color = isGood(value) ? '#137333' : isWarn(value) ? '#c62828' : '#3c4043'
  const bg = isGood(value) ? '#e6f4ea' : isWarn(value) ? '#fce8e6' : '#f8f9fa'
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 12 }}>
      {value}
    </span>
  )
}

function BenefitsPanel({ benefits }) {
  if (!benefits.length) return null
  return (
    <div style={{ margin: '0 16px 0', padding: '16px', background: '#f8f9fa', borderRadius: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#3c4043', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>
        Benefits & Schemes
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {benefits.map((b, i) => {
          const Icon = b.icon
          return (
            <div key={i} style={{
              background: '#fff', borderRadius: 10, padding: '12px 14px',
              border: `1px solid ${b.color}30`, borderLeft: `4px solid ${b.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={16} color={b.color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#202124', flex: 1 }}>{b.scheme}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: b.status === 'received' ? '#e6f4ea' : b.status === 'warning' ? '#fff3e0' : '#e8f0fe',
                  color: b.status === 'received' ? '#137333' : b.status === 'warning' ? '#e65100' : '#1967d2',
                }}>
                  {b.status === 'received' ? '✓ Received' : b.status === 'warning' ? '⚠ Gap' : '✓ Registered'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                {b.details.map((d, j) => (
                  <div key={j}>
                    <div style={{ fontSize: 10, color: '#9aa0a6', textTransform: 'uppercase', letterSpacing: 0.3 }}>{d.label}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#202124' }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProfileCard({ person, onClose }) {
  const benefits = getBenefits(person)
  const hasScooty = benefits.some(b => b.scheme === 'Scooty Scheme')
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 520, height: '100vh', overflowY: 'auto',
        background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          background: 'linear-gradient(135deg,#1a73e8,#4285f4)',
          padding: '24px 24px 20px', color: '#fff', position: 'sticky', top: 0, zIndex: 2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Google Sans',sans-serif" }}>
                {person.n || 'Unknown'}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                {person.blk && `${person.blk} · `}{person.vil || person.tal || person.area || person.addr?.slice(0, 40) || '—'}
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer',
              color: '#fff', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { label: (person.aad === 'Aadhaar Available' || person.aadhar) ? '✓ Aadhaar' : '✗ Aadhaar', ok: !!(person.aad === 'Aadhaar Available' || person.aadhar) },
              { label: person.nidc ? '✓ NIDC' : '✗ NIDC', ok: !!person.nidc },
              { label: person.udid ? '✓ UDID' : '✗ UDID', ok: !!person.udid },
              { label: hasScooty ? '🛵 Scooty' : 'No Scooty', ok: hasScooty },
              ...(person.emp ? [{ label: person.emp === 'Yes' ? '✓ Employed' : '✗ Unemployed', ok: person.emp === 'Yes' }] : []),
            ].map((b, i) => (
              <span key={i} style={{
                background: b.ok ? 'rgba(255,255,255,0.25)' : 'rgba(255,0,0,0.2)',
                color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
              }}>{b.label}</span>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 16 }}>
          <BenefitsPanel benefits={benefits} />
        </div>
        {person.dis && (
          <div style={{ margin: '12px 16px 0', padding: '14px 16px', background: '#fce8e6', borderRadius: 10, border: '1px solid #f5c6c2' }}>
            <div style={{ fontSize: 11, color: '#c62828', fontWeight: 600, marginBottom: 4 }}>DISABILITY</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>{person.dis}</div>
            <div style={{ fontSize: 12, color: '#5f6368', marginTop: 4 }}>
              {person.dpct && `${person.dpct} · `}{person.nat}{person.dreason && ` · ${person.dreason}`}
            </div>
          </div>
        )}
        <div style={{ padding: '12px 16px 32px', flex: 1 }}>
          {SECTIONS.map(({ label, icon: Icon, color, fields }) => {
            const entries = fields.map(f => [FIELD_MAP[f], person[f]]).filter(([, v]) => v)
            if (!entries.length) return null
            return (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 6, borderBottom: `2px solid ${color}20` }}>
                  <Icon size={16} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                  {entries.map(([k, v]) => (
                    <div key={k} style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#9aa0a6', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{k}</div>
                      <Badge value={v} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ResultRow({ r, onSelect }) {
  const benefits = getBenefits(r)
  const meta = SRC_META[r.src] || SRC_META.survey
  return (
    <div onClick={() => onSelect(r)} style={{
      background: '#fff', borderRadius: 12, padding: '14px 16px',
      border: '1px solid #f0f0f0', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'box-shadow 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#1a73e8' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#f0f0f0' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: meta.color,
        color: '#fff', fontWeight: 700, fontSize: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {(r.n || '?')[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#202124', marginBottom: 3 }}>{r.n || '—'}</div>
        <div style={{ fontSize: 12, color: '#5f6368', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {r.g && <span>{r.g}</span>}
          {r.age && <span>Age {r.age}</span>}
          {(r.blk || r.tal) && <span>📍 {r.blk || r.tal}</span>}
          {r.vil && <span>🏘️ {r.vil}</span>}
          {r.mob && <span>📞 {r.mob}</span>}
          {r.dis && <span style={{ color: '#ea4335' }}>{r.dis?.split('(')[0].trim()}</span>}
        </div>
        <div style={{ fontSize: 11, marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: '#9aa0a6', fontWeight: 600, textTransform: 'uppercase' }}>Benefits:</span>
          {benefits.length === 0 && <span style={{ color: '#9aa0a6', fontSize: 11 }}>None on record</span>}
          {benefits.map((b, i) => (
            <span key={i} style={{
              background: b.status === 'warning' ? '#fff3e0' : b.color + '18',
              color: b.status === 'warning' ? '#e65100' : b.color,
              padding: '2px 8px', borderRadius: 10, fontWeight: 600, fontSize: 11,
            }}>
              {b.status === 'warning' ? '⚠' : '✓'} {b.scheme}
            </span>
          ))}
          {(r.aad === 'Aadhaar Available' || r.aadhar) && <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Aadhaar ✓</span>}
          {r.udid && <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>UDID ✓</span>}
          {r.nidc && <span style={{ background: '#e8f0fe', color: '#1967d2', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>NIDC ✓</span>}
        </div>
      </div>
      <ChevronRight size={18} color="#9aa0a6" style={{ flexShrink: 0 }} />
    </div>
  )
}

const PAGE_SIZE = 50

export default function Beneficiary() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [filteredAll, setFilteredAll] = useState(null)  // null = no active filter
  const [page, setPage] = useState(1)
  const [villages, setVillages] = useState([])
  const [totalRecords, setTotalRecords] = useState(null)
  const [vilInput, setVilInput] = useState(() => searchParams.get('vil') || '')
  const inputRef = useRef()
  const dataRef = useRef(null)

  // Parse URL filter params (exclude 'q')
  const urlFilter = useMemo(() => {
    const f = {}
    for (const [k, v] of searchParams.entries()) {
      if (k !== 'q') f[k] = v
    }
    return Object.keys(f).length ? f : null
  }, [searchParams])

  const filterLabel = urlFilter ? getFilterLabel(urlFilter) : null

  useEffect(() => {
    Promise.all([
      cachedFetch('/beneficiaries.json', () => cachedSurvey, d => cachedSurvey = d),
      cachedFetch('/scooty.json', () => cachedScooty, d => cachedScooty = d),
      cachedFetch('/mg.json', () => cachedMg, d => cachedMg = d),
      cachedFetch('/scholarship.json', () => cachedScholarship, d => cachedScholarship = d),
      cachedFetch('/bankloan.json', () => cachedBankloan, d => cachedBankloan = d),
      cachedFetch('/readers.json', () => cachedReaders, d => cachedReaders = d),
      cachedFetch('/udid_uncovered.json', () => cachedUdidUncovered, d => cachedUdidUncovered = d),
    ])
      .then(([survey, scooty, mg, scholarship, bankloan, readers, udidUncovered]) => {
        dataRef.current = [...survey, ...scooty, ...mg, ...scholarship, ...bankloan, ...readers, ...udidUncovered]
        scootyIdx = buildIndex(scooty, ['udid', 'nidc', 'mob', 'aadhar'])
        surveyIdx = buildIndex(survey, ['udid', 'nidc', 'mob'])
        mgIdx = buildIndex(mg, ['mob'])
        scholarshipIdx = buildIndex(scholarship, ['udid', 'nidc', 'mob', 'aadhar'])
        bankloanIdx = buildIndex(bankloan, ['udid', 'nidc', 'mob', 'aadhar'])
        readersIdx = buildIndex(readers, ['udid', 'nidc', 'mob', 'aadhar'])
        udidUncoveredIdx = buildIndex(udidUncovered, ['udid', 'mob'])

        const vilSet = new Set()
        for (const r of survey) if (r.vil) vilSet.add(r.vil.trim())
        for (const r of udidUncovered) if (r.vil) vilSet.add(r.vil.trim())
        setVillages(Array.from(vilSet).sort())
        setTotalRecords(dataRef.current.length)
        setDataLoaded(true)
      })
      .catch(() => setDataError(true))
  }, [])

  // Keep village input in sync with URL (e.g. drill-down navigation from another page)
  useEffect(() => {
    setVilInput(urlFilter?.vil || '')
  }, [urlFilter])

  // Apply URL filter when data loads or params change
  useEffect(() => {
    if (!dataLoaded || !dataRef.current) return
    if (urlFilter) {
      const results = applyFilter(dataRef.current, urlFilter)
      setFilteredAll(results)
      setPage(1)
      setQuery('')
      setSearchResults([])
    } else {
      setFilteredAll(null)
    }
  }, [urlFilter, dataLoaded])

  const doSearch = useCallback((q) => {
    if (!q || q.length < 2 || !dataRef.current) { setSearchResults([]); return }
    const lower = q.toLowerCase().trim()
    const pool = filteredAll ?? dataRef.current
    const matches = []
    for (const r of pool) {
      if (
        (r.n && r.n.toLowerCase().includes(lower)) ||
        (r.mob && r.mob.includes(q)) ||
        (r.aadhar && r.aadhar.toString().includes(q)) ||
        (r.nidc && r.nidc.toLowerCase().includes(lower)) ||
        (r.udid && r.udid.toLowerCase().includes(lower)) ||
        (r.vid && r.vid.toLowerCase().includes(lower)) ||
        (r.pds && r.pds.includes(q)) ||
        (r.rc && r.rc.includes(q)) ||
        (r.veh && r.veh.toLowerCase().includes(lower)) ||
        (r.dap && r.dap.toLowerCase().includes(lower)) ||
        (r.father && r.father.toLowerCase().includes(lower))
      ) {
        matches.push(r)
        if (matches.length >= 50) break
      }
    }
    setSearchResults(matches)
  }, [filteredAll])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 250)
    return () => clearTimeout(t)
  }, [query, doSearch, dataLoaded])

  const clearFilter = () => {
    setSearchParams({})
    setFilteredAll(null)
    setQuery('')
    setSearchResults([])
    setVilInput('')
  }

  const applyVillageFilter = () => {
    const v = vilInput.trim()
    if (!v) return
    setSearchParams({ vil: v })
  }

  // Determine what list to show
  const inSearchMode = query.length >= 2
  const displayList = inSearchMode
    ? searchResults
    : filteredAll ? filteredAll.slice(0, page * PAGE_SIZE) : []

  const totalFiltered = filteredAll?.length ?? 0
  const hasMore = !inSearchMode && filteredAll && page * PAGE_SIZE < filteredAll.length

  return (
    <div>
      <TopBar title="Individual Search" subtitle={`Search ${totalRecords ? totalRecords.toLocaleString() + ' records across 7 datasets' : 'all records'} — enter UDID, Aadhaar, Name, Mobile, NIDC or Vehicle No, or browse by Village/Panchayat, to see all benefits`} />
      <div style={{ padding: 24 }}>

        {/* Active filter banner */}
        {filterLabel && (
          <div style={{
            background: '#e8f0fe', border: '1px solid #1a73e830',
            borderLeft: '4px solid #1a73e8',
            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Filter size={16} color="#1a73e8" />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a73e8' }}>{filterLabel}</span>
              {dataLoaded && (
                <span style={{ fontSize: 12, color: '#5f6368', marginLeft: 12 }}>
                  {totalFiltered.toLocaleString()} matching record{totalFiltered !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button onClick={clearFilter} style={{
              background: 'none', border: '1px solid #1a73e830', borderRadius: 8,
              padding: '4px 12px', fontSize: 12, color: '#1a73e8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <X size={12} /> Clear filter
            </button>
          </div>
        )}

        {/* Search box */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
          maxWidth: 700, margin: '0 auto 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={22} color="#1a73e8" />
            </div>
            <div>
              <div style={{ fontFamily: "'Google Sans',sans-serif", fontSize: 18, fontWeight: 600, color: '#202124' }}>
                {filterLabel ? `Search within: ${filterLabel}` : 'Beneficiary Lookup'}
              </div>
              <div style={{ fontSize: 12, color: '#5f6368' }}>
                {dataLoaded
                  ? filterLabel
                    ? `${totalFiltered.toLocaleString()} records in this filter — search by name, ID, mobile…`
                    : `Search across ${totalRecords?.toLocaleString() ?? ''} records from 7 schemes — shows all benefits received`
                  : dataError ? 'Failed to load data' : 'Loading records…'}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9aa0a6" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={filterLabel ? 'Search within filtered results…' : 'Enter UDID / Aadhaar / Name / Mobile / NIDC / Vehicle No…'}
              disabled={!dataLoaded}
              style={{
                width: '100%', padding: '14px 40px 14px 44px',
                border: '2px solid ' + (query ? '#1a73e8' : '#e0e0e0'),
                borderRadius: 12, fontSize: 15, outline: 'none',
                background: dataLoaded ? '#fff' : '#f8f9fa',
                color: '#202124', transition: 'border-color 0.15s', boxSizing: 'border-box',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSearchResults([]); inputRef.current?.focus() }}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9aa0a6', display: 'flex' }}>
                <X size={18} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['UDID No', 'Aadhaar', 'Name', 'Mobile', 'NIDC No', 'Vehicle No', 'PDS No', 'Voter ID'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#5f6368', background: '#f1f3f4', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>{t}</span>
            ))}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#5f6368', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} color="#ff7043" /> Browse by Village / Panchayat
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                list="village-options"
                value={vilInput}
                onChange={e => setVilInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applyVillageFilter() }}
                placeholder="Type or select a village / panchayat…"
                disabled={!dataLoaded}
                style={{
                  flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 10,
                  fontSize: 13, outline: 'none', color: '#202124',
                  background: dataLoaded ? '#fff' : '#f8f9fa', boxSizing: 'border-box',
                }}
              />
              <datalist id="village-options">
                {villages.map(v => <option key={v} value={v} />)}
              </datalist>
              <button
                onClick={applyVillageFilter}
                disabled={!dataLoaded || !vilInput.trim()}
                style={{
                  padding: '10px 18px', background: vilInput.trim() ? '#1a73e8' : '#e0e0e0',
                  color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  cursor: vilInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {/* Loading / error */}
        {!dataLoaded && !dataError && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9aa0a6' }}>
            <Clock size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading beneficiary data…</div>
          </div>
        )}
        {dataError && (
          <div style={{ textAlign: 'center', padding: 40, color: '#ea4335' }}>
            <AlertCircle size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Failed to load data. Please refresh.</div>
          </div>
        )}

        {/* Results */}
        {displayList.length > 0 && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ fontSize: 13, color: '#5f6368', marginBottom: 12, fontWeight: 500 }}>
              {inSearchMode
                ? (searchResults.length >= 50 ? 'Showing top 50 matches' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} found`)
                : `Showing ${Math.min(page * PAGE_SIZE, totalFiltered).toLocaleString()} of ${totalFiltered.toLocaleString()} records`}
              <span style={{ color: '#9aa0a6', fontWeight: 400, marginLeft: 8 }}>· Click any record to view full profile & benefits</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayList.map((r, i) => (
                <ResultRow key={i} r={r} onSelect={setSelected} />
              ))}
            </div>
            {hasMore && (
              <button onClick={() => setPage(p => p + 1)} style={{
                display: 'block', width: '100%', marginTop: 16, padding: '12px',
                background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 10,
                fontSize: 13, color: '#1a73e8', fontWeight: 600, cursor: 'pointer',
              }}>
                Load more ({Math.min(PAGE_SIZE, totalFiltered - page * PAGE_SIZE)} remaining of {totalFiltered - page * PAGE_SIZE})
              </button>
            )}
          </div>
        )}

        {/* No results */}
        {inSearchMode && dataLoaded && searchResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9aa0a6' }}>
            <Search size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#5f6368' }}>No matching records</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Try a different name, UDID, Aadhaar, or ID number</div>
          </div>
        )}

        {/* Empty state — no filter, no search */}
        {!query && !filterLabel && dataLoaded && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9aa0a6', maxWidth: 500, margin: '0 auto' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Gift size={36} color="#1a73e8" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#3c4043', marginBottom: 8 }}>
              Beneficiary & Benefits Lookup
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: '#5f6368' }}>
              Enter any identifier to instantly see the person's profile and <strong>all government scheme benefits received</strong> — or click any stat card or table row across the dashboard to view that group's beneficiaries.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { icon: FileText, label: 'DAP Survey', color: '#34a853' },
                { icon: Bike, label: 'Scooty Scheme', color: '#1a73e8' },
                { icon: HeartHandshake, label: 'Maintenance Grant', color: '#9334e6' },
                { icon: Award, label: 'Scholarship', color: '#1967d2' },
                { icon: Landmark, label: 'Bank Loan Subsidy', color: '#34a853' },
                { icon: BookOpen, label: 'Readers Allowance', color: '#00acc1' },
                { icon: ShieldAlert, label: 'UDID Not Covered', color: '#f9a825' },
                { icon: MapPin, label: 'Browse by Village / Panchayat', color: '#ff7043' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, background: color + '12', border: `1px solid ${color}30`, borderRadius: 10, padding: '8px 14px' }}>
                  <Icon size={16} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter active but no search and data loading */}
        {filterLabel && !dataLoaded && !dataError && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9aa0a6' }}>
            <Clock size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading — applying filter: {filterLabel}…</div>
          </div>
        )}
      </div>

      {selected && <ProfileCard person={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
