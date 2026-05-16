import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { Activity, Zap, Heart, Eye } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853','#9334e6','#00acc1','#ff7043','#8d6e63','#607d8b','#78909c']

const disabilityData = Object.entries(stats.disability_type)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value]) => ({ name, value, pct: ((value / stats.total) * 100).toFixed(1) }))

const natureData = Object.entries(stats.nature).map(([name, value]) => ({ name, value }))

// Maps stats.js labels → actual dis field search strings in beneficiaries.json
const disFilterMap = {
  'Intellectual Disability': 'MR',
  'Hearing Impairment': 'HH',
  'Speech & Language': 'Speech and Language',
  'Haemophilia': 'Hemophilia',
}
const getDisFilter = (name) => disFilterMap[name] || name

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <span style={{ color: '#d0d0d0', fontSize: 10 }}> ⇅</span>
  return <span style={{ color: '#1a73e8', fontSize: 10 }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
}

export default function Disability() {
  const navigate = useNavigate()
  const top1 = disabilityData[0]
  const [sortKey, setSortKey] = useState('value')
  const [sortDir, setSortDir] = useState('desc')
  const [highlight, setHighlight] = useState(null)

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sortedData = [...disabilityData].sort((a, b) => {
    const av = sortKey === 'name' ? a.name : sortKey === 'pct' ? parseFloat(a.pct) : a.value
    const bv = sortKey === 'name' ? b.name : sortKey === 'pct' ? parseFloat(b.pct) : b.value
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const thStyle = (key) => ({
    textAlign: key === 'name' ? 'left' : 'right',
    padding: '8px 10px',
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
      <TopBar title="Disability Analysis" subtitle="Types, nature and distribution of disabilities" />
      <div style={{ padding: 24 }}>

        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Most Common Disability" value={top1.value}
            icon={Activity} color="#1a73e8" sub={top1.name}
            onClick={() => navigate(`/beneficiary?dis=${encodeURIComponent(top1.name.split(' ')[0])}`)} />
          <StatCard label="Permanent Cases" value={stats.permanent_disability}
            icon={Zap} color="#ea4335" sub="Nature of disability"
            onClick={() => navigate('/beneficiary?nat=Permanent')} />
          <StatCard label="Hearing Impairment" value={stats.disability_type['Hearing Impairment']}
            icon={Heart} color="#34a853" sub="Type 9"
            onClick={() => navigate('/beneficiary?dis=HH')} />
          <StatCard label="Visual Impairment" value={(stats.disability_type['Blindness'] || 0) + (stats.disability_type['Low Vision'] || 0)}
            icon={Eye} color="#fbbc04" sub="Blindness + Low Vision"
            onClick={() => navigate('/beneficiary?dis=Blindness')} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <ChartCard title="All Disability Types" style={{ gridColumn:'1 / -1' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={disabilityData} margin={{ left:8, right:16, top:20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }}
                  angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" radius={[4,4,0,0]} style={{ cursor:'pointer' }}
                  onClick={(data) => navigate(`/beneficiary?dis=${encodeURIComponent(getDisFilter(data.name))}`)}>
                  {disabilityData.map((d, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]}
                      opacity={highlight && d.name !== highlight && highlight !== 'Permanent' ? 0.35 : 1} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize:11, color:'#9aa0a6', textAlign:'center', marginTop:4 }}>Click any bar to view those beneficiaries</p>
          </ChartCard>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Permanent vs Temporary">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={natureData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={4}
                  label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                  labelLine={false}
                  style={{ cursor:'pointer' }}
                  onClick={(data) => navigate(`/beneficiary?nat=${encodeURIComponent(data.name)}`)}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#fbbc04" />
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:32, marginTop:8 }}>
              {natureData.map((d, i) => (
                <div key={i} onClick={() => navigate(`/beneficiary?nat=${encodeURIComponent(d.name)}`)}
                  style={{ textAlign:'center', cursor:'pointer' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:i===0?'#1a73e8':'#fbbc04' }}>
                    {((d.value / stats.total) * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize:12, color:'#5f6368' }}>{d.name}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize:11, color:'#9aa0a6', textAlign:'center', marginTop:8 }}>Click to view beneficiaries</p>
          </ChartCard>

          <ChartCard title="Disability Breakdown Table">
            {highlight && (
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#1a73e8', fontWeight: 500 }}>Highlighted: {highlight}</span>
                <button onClick={() => setHighlight(null)} style={{ fontSize: 11, color: '#ea4335', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px' }}>✕ clear</button>
              </div>
            )}
            <div style={{ overflowY:'auto', maxHeight:280 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={thStyle('name')} onClick={() => handleSort('name')}>
                      Type <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th style={thStyle('value')} onClick={() => handleSort('value')}>
                      Count <SortIcon col="value" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                    <th style={thStyle('pct')} onClick={() => handleSort('pct')}>
                      % <SortIcon col="pct" sortKey={sortKey} sortDir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((d, i) => {
                    const origIdx = disabilityData.findIndex(x => x.name === d.name)
                    const isHighlighted = highlight === d.name
                    const disKey = getDisFilter(d.name)
                    return (
                      <tr key={i}
                        onClick={() => navigate(`/beneficiary?dis=${encodeURIComponent(disKey)}`)}
                        style={{
                          borderBottom:'1px solid #f8f9fa',
                          background: isHighlighted ? '#e8f0fe' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!isHighlighted) e.currentTarget.style.background = '#f8f9fa' }}
                        onMouseLeave={e => { if (!isHighlighted) e.currentTarget.style.background = '' }}>
                        <td style={{ padding:'7px 10px', color:'#202124' }}>
                          <span style={{
                            display:'inline-block', width:10, height:10,
                            borderRadius:'50%', background:COLORS[origIdx%COLORS.length],
                            marginRight:8
                          }} />
                          {d.name}
                        </td>
                        <td style={{ padding:'7px 10px', textAlign:'right', fontWeight:600, color:'#1a73e8' }}>
                          {d.value.toLocaleString()}
                        </td>
                        <td style={{ padding:'7px 10px', textAlign:'right', color:'#5f6368' }}>
                          {d.pct}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize:11, color:'#9aa0a6', marginTop:8 }}>Click any row to view those beneficiaries</p>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
