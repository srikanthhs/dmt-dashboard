import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Legend, LineChart, Line, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import { Bike, Users, FileCheck, CreditCard, Search, X, ChevronRight, ShieldCheck } from 'lucide-react'
import scootyStats from '../data/scootyStats'

const stats = scootyStats
const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9334e6', '#00acc1']

const yearData = Object.entries(stats.by_year)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([name, value]) => ({ name, value }))

const genderData = Object.entries(stats.by_gender).map(([name, value]) => ({ name, value }))

const disData = Object.entries(stats.by_dis_pct)
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([name, value]) => ({ name, value }))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

let cachedScooty = null

export default function Scooty() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [sortKey, setSortKey] = useState('n')
  const [sortDir, setSortDir] = useState('asc')
  const dataRef = useRef(null)
  const inputRef = useRef()

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedResults = [...results].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: '#d0d0d0', fontSize: 10 }}> ⇅</span>
    return <span style={{ color: '#1a73e8', fontSize: 10 }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
  }

  const thStyle = (key) => ({
    textAlign: 'left', padding: '9px 10px',
    color: sortKey === key ? '#1a73e8' : '#5f6368',
    fontWeight: 500, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  })

  useEffect(() => {
    if (cachedScooty) { dataRef.current = cachedScooty; setLoaded(true); return }
    fetch('/scooty.json').then(r => r.json()).then(d => {
      cachedScooty = d; dataRef.current = d; setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!query || query.length < 2 || !dataRef.current) { setResults([]); return }
    const q = query.toLowerCase().trim()
    const t = setTimeout(() => {
      const matches = dataRef.current.filter(r =>
        (r.n && r.n.toLowerCase().includes(q)) ||
        (r.mob && r.mob.includes(query)) ||
        (r.aadhar && r.aadhar.includes(query)) ||
        (r.udid && r.udid.toLowerCase().includes(q)) ||
        (r.nidc && r.nidc.toLowerCase().includes(q)) ||
        (r.veh && r.veh.toLowerCase().includes(q)) ||
        (r.fy && r.fy.includes(query))
      ).slice(0, 20)
      setResults(matches)
    }, 250)
    return () => clearTimeout(t)
  }, [query, loaded])

  return (
    <div>
      <TopBar title="Scooty Beneficiaries" subtitle="Motorised vehicles distributed to locomotor disability beneficiaries" />
      <div style={{ padding: 24 }}>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total Beneficiaries" value={stats.total} icon={Bike} color="#1a73e8" sub="Last 3 financial years" />
          <StatCard label="Male Beneficiaries" value={stats.by_gender.Male || 0} icon={Users} color="#34a853" sub={`${(((stats.by_gender.Male||0)/stats.total)*100).toFixed(1)}% of total`} />
          <StatCard label="Female Beneficiaries" value={stats.by_gender.Female || 0} icon={Users} color="#ea4335" sub={`${(((stats.by_gender.Female||0)/stats.total)*100).toFixed(1)}% of total`} />
          <StatCard label="UDID Verified" value={stats.udid} icon={FileCheck} color="#9334e6" sub={`${((stats.udid/stats.total)*100).toFixed(1)}% coverage`} />
          <StatCard label="Aadhaar Recorded" value={stats.aadhaar} icon={ShieldCheck} color="#fbbc04" sub={`${((stats.aadhaar/stats.total)*100).toFixed(1)}% recorded`} />
          <StatCard label="NIDC Verified" value={stats.nidc} icon={CreditCard} color="#00acc1" sub={`${((stats.nidc/stats.total)*100).toFixed(1)}% verified`} />
        </div>

        {/* Charts row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <ChartCard title="Year-wise Distribution">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={yearData} margin={{ top: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {yearData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: '#5f6368', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
              {yearData.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS[i % COLORS.length] }}>{d.value}</div>
                  <div style={{ fontSize: 10, color: '#9aa0a6' }}>{d.name.replace('20', "'")}</div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Gender Split">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={4}
                  label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                  labelLine={false}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#ea4335" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize: 12, color: '#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 4 }}>
              {genderData.map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? '#1a73e8' : '#ea4335' }}>{d.value}</div>
                  <div style={{ fontSize: 12, color: '#5f6368' }}>{d.name}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Charts row 2 */}
        <div style={{ marginBottom: 24 }}>
          <ChartCard title="Disability Percentage Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={disData} margin={{ top: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#1a73e8" radius={[4, 4, 0, 0]}>
                  {disData.map((_, i) => <Cell key={i} fill={`hsl(${210 + i * 12},75%,${50 + i * 2}%)`} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: '#5f6368', fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Search section */}
        <ChartCard title="Search Scooty Beneficiary">
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} color="#9aa0a6" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={loaded ? `Search by Name, Aadhaar, Mobile, UDID, Vehicle No… (${stats.total} records)` : 'Loading…'}
              disabled={!loaded}
              style={{
                width: '100%', padding: '11px 36px 11px 38px',
                border: '1px solid ' + (query ? '#1a73e8' : '#e0e0e0'),
                borderRadius: 10, fontSize: 14, outline: 'none',
                background: loaded ? '#fff' : '#f8f9fa',
                boxSizing: 'border-box', color: '#202124',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results table */}
          {results.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: 12, color: '#5f6368', marginBottom: 6 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} · Click column headers to sort
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    <th style={thStyle('n')} onClick={() => handleSort('n')}>Name <SortIcon col="n" /></th>
                    <th style={thStyle('age')} onClick={() => handleSort('age')}>Age/Gender <SortIcon col="age" /></th>
                    <th style={thStyle('mob')} onClick={() => handleSort('mob')}>Mobile <SortIcon col="mob" /></th>
                    <th style={thStyle('aadhar')} onClick={() => handleSort('aadhar')}>Aadhaar <SortIcon col="aadhar" /></th>
                    <th style={thStyle('udid')} onClick={() => handleSort('udid')}>UDID <SortIcon col="udid" /></th>
                    <th style={thStyle('veh')} onClick={() => handleSort('veh')}>Vehicle No <SortIcon col="veh" /></th>
                    <th style={thStyle('fy')} onClick={() => handleSort('fy')}>F.Y. <SortIcon col="fy" /></th>
                    <th style={{ padding: '9px 10px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, i) => (
                    <tr key={i}
                      onClick={() => setSelected(r)}
                      style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '9px 10px', fontWeight: 600, color: '#202124' }}>{r.n || '—'}</td>
                      <td style={{ padding: '9px 10px', color: '#5f6368' }}>{r.age}{r.age && r.g ? ' / ' : ''}{r.g}</td>
                      <td style={{ padding: '9px 10px', color: '#5f6368' }}>{r.mob || '—'}</td>
                      <td style={{ padding: '9px 10px', color: '#5f6368', fontFamily: 'monospace', fontSize: 12 }}>{r.aadhar ? r.aadhar.toString().replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—'}</td>
                      <td style={{ padding: '9px 10px' }}>
                        {r.udid
                          ? <span style={{ background: '#e6f4ea', color: '#137333', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>✓ {r.udid.slice(-8)}</span>
                          : <span style={{ color: '#9aa0a6' }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 10px', color: '#1a73e8', fontWeight: 500 }}>{r.veh || '—'}</td>
                      <td style={{ padding: '9px 10px', color: '#5f6368' }}>{r.fy || '—'}</td>
                      <td style={{ padding: '9px 10px' }}><ChevronRight size={14} color="#9aa0a6" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {query.length >= 2 && loaded && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#9aa0a6', fontSize: 14 }}>No matching records found</div>
          )}
          {!query && loaded && (
            <div style={{ fontSize: 12, color: '#9aa0a6', textAlign: 'center', padding: '8px 0' }}>
              Type at least 2 characters to search
            </div>
          )}
        </ChartCard>

        {/* Detail modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelected(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 16, width: 560, maxHeight: '85vh',
              overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}>
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg,#1a73e8,#4285f4)', padding: '24px', color: '#fff', borderRadius: '16px 16px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{selected.n || '—'}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                      {selected.g}{selected.age ? `, Age ${selected.age}` : ''} · {selected.fy || '—'}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {selected.veh && <span style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 12 }}>🛵 {selected.veh}</span>}
                  {selected.dpct && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>{selected.dpct} Disability</span>}
                  {selected.aadhar && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ Aadhaar</span>}
                  {selected.udid && <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ UDID</span>}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: 24 }}>
                {[
                  { label: 'Identity & Documents', color: '#1a73e8', rows: [
                    ['Aadhaar', selected.aadhar ? selected.aadhar.toString().replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : '—'],
                    ['UDID Number', selected.udid || '—'],
                    ['NIDC Number', selected.nidc || '—'],
                    ['Mobile', selected.mob || '—'],
                  ]},
                  { label: 'Vehicle Details', color: '#34a853', rows: [
                    ['Vehicle Number', selected.veh || '—'],
                    ['RTO', selected.rto || '—'],
                    ['Scooter Type', selected.stype || '—'],
                    ['Leg Type', selected.leg || '—'],
                    ['Type of Fund', selected.fund || '—'],
                    ['MLA Constituency', selected.mla || '—'],
                    ['Financial Year', selected.fy || '—'],
                  ]},
                  { label: 'Disability', color: '#ea4335', rows: [
                    ['Disability Type', selected.dis || 'Locomotor Disability'],
                    ['Disability %', selected.dpct || '—'],
                  ]},
                  { label: 'Address', color: '#ff7043', rows: [
                    ['Address', selected.addr || '—'],
                  ]},
                ].map(({ label, color, rows }) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, borderBottom: `2px solid ${color}20`, paddingBottom: 6 }}>
                      {label}
                    </div>
                    {rows.map(([k, v]) => v && v !== '—' ? (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8f9fa' }}>
                        <span style={{ fontSize: 12, color: '#9aa0a6', minWidth: 140 }}>{k}</span>
                        <span style={{ fontSize: 13, color: '#202124', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>
                ))}
                {selected.remarks && (
                  <div style={{ background: '#fff8e1', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#5f6368' }}>
                    <span style={{ fontWeight: 600, color: '#f9a825' }}>Remarks: </span>{selected.remarks}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
