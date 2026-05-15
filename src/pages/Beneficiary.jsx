import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, User, Phone, MapPin, FileText, Heart, Home, Briefcase, GraduationCap, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import TopBar from '../components/TopBar'

let cachedData = null

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
}

const SECTIONS = [
  {
    label: 'Personal Information', icon: User, color: '#1a73e8',
    fields: ['n', 'dob', 'age', 'g', 'mar', 'caste', 'mob'],
  },
  {
    label: 'Disability Details', icon: Heart, color: '#ea4335',
    fields: ['dis', 'dpct', 'nat', 'dreason', 'pcare'],
  },
  {
    label: 'Documents & IDs', icon: FileText, color: '#34a853',
    fields: ['aad', 'nidc', 'udid', 'vid', 'rc', 'pds', 'stat'],
  },
  {
    label: 'Livelihood', icon: Briefcase, color: '#9334e6',
    fields: ['emp', 'etype', 'inc'],
  },
  {
    label: 'Education', icon: GraduationCap, color: '#fbbc04',
    fields: ['edu'],
  },
  {
    label: 'Infrastructure', icon: Home, color: '#00acc1',
    fields: ['hstat', 'htype', 'elec', 'water', 'toilet', 'fam'],
  },
  {
    label: 'Address', icon: MapPin, color: '#ff7043',
    fields: ['door', 'str', 'vil', 'blk', 'tal', 'pin', 'area'],
  },
]

function Badge({ value }) {
  if (!value) return <span style={{ color: '#9aa0a6', fontSize: 13 }}>—</span>
  const isGood = v => ['Yes', 'Aadhaar Available', 'Own', 'Permanent'].includes(v)
  const isWarn = v => ['No', 'Aadhaar Blank', 'Rented', 'Temporary'].includes(v)
  const color = isGood(value) ? '#34a853' : isWarn(value) ? '#ea4335' : '#3c4043'
  const bg = isGood(value) ? '#e6f4ea' : isWarn(value) ? '#fce8e6' : '#f8f9fa'
  return (
    <span style={{
      background: bg, color, fontSize: 12, fontWeight: 500,
      padding: '3px 10px', borderRadius: 12, display: 'inline-block',
    }}>{value}</span>
  )
}

function ProfileCard({ person, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, height: '100vh', overflowY: 'auto',
          background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
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
                {person.blk} · {person.vil || person.tal || person.area || '—'}
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

          {/* Quick badges */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { label: person.aad === 'Aadhaar Available' ? '✓ Aadhaar' : '✗ Aadhaar',
                ok: person.aad === 'Aadhaar Available' },
              { label: person.nidc ? '✓ NIDC' : '✗ NIDC', ok: !!person.nidc },
              { label: person.udid ? '✓ UDID' : '✗ UDID', ok: !!person.udid },
              { label: person.emp === 'Yes' ? '✓ Employed' : '✗ Unemployed', ok: person.emp === 'Yes' },
            ].map((b, i) => (
              <span key={i} style={{
                background: b.ok ? 'rgba(255,255,255,0.25)' : 'rgba(255,0,0,0.2)',
                color: '#fff', fontSize: 11, fontWeight: 600,
                padding: '3px 10px', borderRadius: 12,
              }}>{b.label}</span>
            ))}
          </div>
        </div>

        {/* Disability highlight */}
        {person.dis && (
          <div style={{
            margin: '16px 16px 0', padding: '14px 16px',
            background: '#fce8e6', borderRadius: 10,
            border: '1px solid #f5c6c2',
          }}>
            <div style={{ fontSize: 11, color: '#c62828', fontWeight: 600, marginBottom: 4 }}>DISABILITY</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>{person.dis}</div>
            <div style={{ fontSize: 12, color: '#5f6368', marginTop: 4 }}>
              {person.dpct && `${person.dpct}% · `}{person.nat}{person.dreason && ` · ${person.dreason}`}
            </div>
          </div>
        )}

        {/* Sections */}
        <div style={{ padding: '12px 16px 32px', flex: 1 }}>
          {SECTIONS.map(({ label, icon: Icon, color, fields }) => {
            const entries = fields.map(f => [FIELD_MAP[f], person[f]]).filter(([, v]) => v)
            if (!entries.length) return null
            return (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 10, paddingBottom: 6,
                  borderBottom: `2px solid ${color}20`,
                }}>
                  <Icon size={16} color={color} />
                  <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                  {entries.map(([k, v]) => (
                    <div key={k} style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: '#9aa0a6', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>
                        {k}
                      </div>
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

export default function Beneficiary() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [dataError, setDataError] = useState(false)
  const inputRef = useRef()
  const dataRef = useRef(null)

  useEffect(() => {
    if (cachedData) { dataRef.current = cachedData; setDataLoaded(true); return }
    fetch('/beneficiaries.json')
      .then(r => r.json())
      .then(d => { cachedData = d; dataRef.current = d; setDataLoaded(true) })
      .catch(() => setDataError(true))
  }, [])

  const doSearch = useCallback((q) => {
    if (!q || q.length < 2 || !dataRef.current) { setResults([]); return }
    const lower = q.toLowerCase().trim()
    const matches = []
    for (const r of dataRef.current) {
      if (
        (r.n && r.n.toLowerCase().includes(lower)) ||
        (r.mob && r.mob.includes(q)) ||
        (r.nidc && r.nidc.toLowerCase().includes(lower)) ||
        (r.udid && r.udid.toLowerCase().includes(lower)) ||
        (r.vid && r.vid.toLowerCase().includes(lower)) ||
        (r.pds && r.pds.includes(q)) ||
        (r.rc && r.rc.includes(q)) ||
        (r.dap && r.dap.toLowerCase().includes(lower))
      ) {
        matches.push(r)
        if (matches.length >= 20) break
      }
    }
    setResults(matches)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 250)
    return () => clearTimeout(t)
  }, [query, doSearch, dataLoaded])

  const statusColor = status => {
    if (!status) return '#9aa0a6'
    if (status.includes('Certificate')) return '#ea4335'
    if (status.includes('Enrolled')) return '#fbbc04'
    return '#34a853'
  }

  return (
    <div>
      <TopBar title="Beneficiary Search" subtitle="Search by Name, Mobile, NIDC, UDID, Voter ID, or PDS Number" />
      <div style={{ padding: 24 }}>

        {/* Search box */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0',
          maxWidth: 700, margin: '0 auto 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={22} color="#1a73e8" />
            </div>
            <div>
              <div style={{ fontFamily: "'Google Sans',sans-serif", fontSize: 18, fontWeight: 600, color: '#202124' }}>
                Individual Beneficiary Lookup
              </div>
              <div style={{ fontSize: 12, color: '#5f6368' }}>
                {dataLoaded
                  ? `Search across ${(15429).toLocaleString()} records`
                  : dataError ? 'Failed to load data' : 'Loading records...'}
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color="#9aa0a6" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Name / Mobile / NIDC / UDID / Voter ID / PDS Number..."
              disabled={!dataLoaded}
              style={{
                width: '100%', padding: '14px 40px 14px 44px',
                border: '2px solid ' + (query ? '#1a73e8' : '#e0e0e0'),
                borderRadius: 12, fontSize: 15, outline: 'none',
                background: dataLoaded ? '#fff' : '#f8f9fa',
                color: '#202124', transition: 'border-color 0.15s',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: '#9aa0a6', display: 'flex',
                }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search hint tags */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Name', 'Mobile', 'NIDC No', 'UDID No', 'Voter ID', 'PDS No'].map(t => (
              <span key={t} style={{
                fontSize: 11, color: '#5f6368', background: '#f1f3f4',
                padding: '3px 10px', borderRadius: 20, fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {!dataLoaded && !dataError && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9aa0a6' }}>
            <Clock size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading beneficiary data...</div>
          </div>
        )}

        {dataError && (
          <div style={{ textAlign: 'center', padding: 40, color: '#ea4335' }}>
            <AlertCircle size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Failed to load data. Please refresh.</div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ fontSize: 13, color: '#5f6368', marginBottom: 12, fontWeight: 500 }}>
              {results.length >= 20 ? 'Showing top 20 matches' : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => setSelected(r)} style={{
                  background: '#fff', borderRadius: 12, padding: '14px 16px',
                  border: '1px solid #f0f0f0', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = '#1a73e8' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#f0f0f0' }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: '#1a73e8', color: '#fff', fontWeight: 700, fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(r.n || '?')[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#202124', marginBottom: 3 }}>
                      {r.n || '—'}
                    </div>
                    <div style={{ fontSize: 12, color: '#5f6368', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {r.g && <span>{r.g}</span>}
                      {r.age && <span>Age {r.age}</span>}
                      {r.blk && <span>📍 {r.blk}</span>}
                      {r.mob && <span>📞 {r.mob}</span>}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.dis && (
                        <span style={{ background: '#fce8e6', color: '#c62828', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                          {r.dis.split('(')[0].trim()}
                        </span>
                      )}
                      {r.aad === 'Aadhaar Available' && (
                        <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>Aadhaar ✓</span>
                      )}
                      {r.nidc && (
                        <span style={{ background: '#e8f0fe', color: '#1967d2', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>NIDC ✓</span>
                      )}
                      {r.udid && (
                        <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>UDID ✓</span>
                      )}
                      {r.stat && (
                        <span style={{ color: statusColor(r.stat), fontSize: 11 }}>{r.stat}</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight size={18} color="#9aa0a6" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {query.length >= 2 && dataLoaded && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9aa0a6' }}>
            <Search size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#5f6368' }}>No matching records</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Try a different name, mobile, or ID number</div>
          </div>
        )}

        {/* Empty state */}
        {!query && dataLoaded && (
          <div style={{ textAlign: 'center', padding: 48, color: '#9aa0a6', maxWidth: 480, margin: '0 auto' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#e8f0fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <User size={36} color="#1a73e8" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#3c4043', marginBottom: 8 }}>
              Search for a Beneficiary
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              Enter any identifier — name, mobile number, NIDC, UDID, Voter ID, or PDS number to view the person's complete profile.
            </div>
          </div>
        )}
      </div>

      {/* Profile side panel */}
      {selected && <ProfileCard person={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
