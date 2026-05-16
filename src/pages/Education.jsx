import { useState } from 'react'
import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { GraduationCap, BookOpen, Award, School } from 'lucide-react'

const COLORS = ['#1a73e8','#1565c0','#1976d2','#1e88e5','#2196f3','#42a5f5','#64b5f6','#90caf9','#bbdefb','#e3f2fd','#f5f5f5','#eeeeee']

const eduData = Object.entries(stats.education)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value]) => ({ name, value, pct: ((value / stats.total) * 100).toFixed(1) }))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <span style={{ color: '#d0d0d0', fontSize: 10 }}> ⇅</span>
  return <span style={{ color: '#1a73e8', fontSize: 10 }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
}

export default function Education() {
  const higherEdu = (stats.education['Under Graduate'] || 0) +
    (stats.education['Post Graduate'] || 0) + (stats.education['Ph.D'] || 0) +
    (stats.education['Diploma'] || 0)
  const noFormal = stats.education['No Formal Education'] || 0
  const primary = (stats.education['Upto 5th Std'] || 0) + (stats.education['Below 5th Std'] || 0)

  const [sortKey, setSortKey] = useState('value')
  const [sortDir, setSortDir] = useState('desc')
  const [highlight, setHighlight] = useState(null)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortedData = [...eduData].sort((a, b) => {
    const av = sortKey === 'name' ? a.name : sortKey === 'pct' ? parseFloat(a.pct) : a.value
    const bv = sortKey === 'name' ? b.name : sortKey === 'pct' ? parseFloat(b.pct) : b.value
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const thStyle = (key) => ({
    textAlign: key === 'name' ? 'left' : 'right',
    padding: '10px 12px',
    color: sortKey === key ? '#1a73e8' : '#5f6368',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
  })

  return (
    <div>
      <TopBar title="Education" subtitle="Educational attainment of differently-abled persons" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Higher Education" value={higherEdu}
            icon={GraduationCap} color="#1a73e8"
            sub={`${((higherEdu/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => setHighlight('Under Graduate')} />
          <StatCard label="No Formal Education" value={noFormal}
            icon={BookOpen} color="#ea4335"
            sub={`${((noFormal/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => setHighlight('No Formal Education')} />
          <StatCard label="Primary Level" value={primary}
            icon={School} color="#fbbc04"
            sub="Up to 5th standard"
            onClick={() => setHighlight('Upto 5th Std')} />
          <StatCard label="Ph.D Holders" value={stats.education['Ph.D'] || 16}
            icon={Award} color="#34a853"
            sub="Highest qualification"
            onClick={() => setHighlight('Ph.D')} />
        </div>

        <ChartCard title="Education Level Distribution" style={{ marginBottom:16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eduData} margin={{ left:8, right:16, bottom:20, top:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }}
                angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {eduData.map((d, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]}
                    opacity={highlight && d.name !== highlight ? 0.35 : 1} />
                ))}
                <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Education Breakdown">
          {highlight && (
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>Filtered: {highlight}</span>
              <button onClick={() => setHighlight(null)} style={{ fontSize: 11, color: '#ea4335', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>✕ clear</button>
            </div>
          )}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  <th style={thStyle('name')} onClick={() => handleSort('name')}>
                    Level <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th style={thStyle('value')} onClick={() => handleSort('value')}>
                    Count <SortIcon col="value" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th style={thStyle('pct')} onClick={() => handleSort('pct')}>
                    Percentage <SortIcon col="pct" sortKey={sortKey} sortDir={sortDir} />
                  </th>
                  <th style={{ ...thStyle('dist'), textAlign: 'left' }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((d, i) => {
                  const origIdx = eduData.findIndex(x => x.name === d.name)
                  const isHighlighted = highlight && d.name === highlight
                  return (
                    <tr key={i}
                      onClick={() => setHighlight(highlight === d.name ? null : d.name)}
                      style={{
                        borderBottom:'1px solid #f0f0f0',
                        background: isHighlighted ? '#e8f0fe' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isHighlighted) e.currentTarget.style.background = '#f8f9fa' }}
                      onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.background = '' }}>
                      <td style={{ padding:'9px 12px', color:'#202124' }}>{d.name}</td>
                      <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:600 }}>{d.value.toLocaleString()}</td>
                      <td style={{ padding:'9px 12px', textAlign:'right', color:'#5f6368' }}>{d.pct}%</td>
                      <td style={{ padding:'9px 12px', width:200 }}>
                        <div style={{ height:6, background:'#f1f3f4', borderRadius:3, overflow:'hidden' }}>
                          <div style={{
                            height:'100%', width:`${d.pct}%`,
                            background: COLORS[origIdx % COLORS.length], borderRadius:3
                          }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
