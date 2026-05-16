import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LabelList, XAxis, YAxis, CartesianGrid
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { FileCheck, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:14, fontWeight:600, color: p.fill || '#202124' }}>{p.name}: {p.value?.toLocaleString()}</p>
      ))}
    </div>
  )
}

const ProgressBar = ({ label, value, max, color = '#1a73e8' }) => {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:13, color:'#3c4043' }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color:'#202124' }}>
          {value.toLocaleString()} <span style={{ color:'#5f6368', fontWeight:400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height:8, background:'#f1f3f4', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.5s ease' }} />
      </div>
    </div>
  )
}

const SortIcon = ({ col, sortKey, sortDir }) => {
  if (sortKey !== col) return <span style={{ color:'#d0d0d0', fontSize:10 }}> ⇅</span>
  return <span style={{ color:'#1a73e8', fontSize:10 }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
}

const noUdid = stats.total - stats.udid_holders
const noNidc = stats.total - stats.nidc_holders
const noAadhaar = stats.total - stats.aadhaar_linked

const gapData = [
  { name: 'UDID', Issued: stats.udid_holders, Pending: noUdid },
  { name: 'NIDC', Issued: stats.nidc_holders, Pending: noNidc },
  { name: 'Aadhaar', Issued: stats.aadhaar_linked, Pending: noAadhaar },
]

const priorityItems = [
  {
    doc: 'UDID Card',
    pending: noUdid,
    pct: ((noUdid / stats.total) * 100).toFixed(1),
    urgency: 'High',
    color: '#ea4335',
    note: 'Needed to access most central govt schemes',
  },
  {
    doc: 'Aadhaar Linkage',
    pending: noAadhaar,
    pct: ((noAadhaar / stats.total) * 100).toFixed(1),
    urgency: 'Medium',
    color: '#fbbc04',
    note: 'Required for DBT and subsidy transfers',
  },
  {
    doc: 'NIDC Card',
    pending: noNidc,
    pct: ((noNidc / stats.total) * 100).toFixed(1),
    urgency: 'Medium',
    color: '#1a73e8',
    note: 'State disability identity card for Tamil Nadu schemes',
  },
]

const tableData = [
  { doc: 'UDID Card', issued: stats.udid_holders, pending: noUdid, pct: ((stats.udid_holders/stats.total)*100).toFixed(1) },
  { doc: 'NIDC Card', issued: stats.nidc_holders, pending: noNidc, pct: ((stats.nidc_holders/stats.total)*100).toFixed(1) },
  { doc: 'Aadhaar', issued: stats.aadhaar_linked, pending: noAadhaar, pct: ((stats.aadhaar_linked/stats.total)*100).toFixed(1) },
  { doc: 'Voter ID (est.)', issued: Math.round(stats.total * 0.72), pending: Math.round(stats.total * 0.28), pct: '72.0' },
  { doc: 'Ration Card (est.)', issued: Math.round(stats.total * 0.85), pending: Math.round(stats.total * 0.15), pct: '85.0' },
]

export default function Benefits() {
  const navigate = useNavigate()
  const coverageRef = useRef()
  const udidRef = useRef()
  const aadhaarRef = useRef()
  const gapRef = useRef()

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const aadhaarData = [
    { name:'Linked', value:stats.aadhaar_linked },
    { name:'Not Linked', value:noAadhaar },
  ]
  const udidData = [
    { name:'UDID Issued', value:stats.udid_holders },
    { name:'Not Issued', value:noUdid },
  ]

  const [sortKey, setSortKey] = useState('issued')
  const [sortDir, setSortDir] = useState('desc')
  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }
  const sortedTable = [...tableData].sort((a, b) => {
    const av = sortKey === 'doc' ? a.doc : sortKey === 'pct' ? parseFloat(a.pct) : a[sortKey]
    const bv = sortKey === 'doc' ? b.doc : sortKey === 'pct' ? parseFloat(b.pct) : b[sortKey]
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  const thStyle = (key) => ({
    textAlign: key === 'doc' ? 'left' : 'right',
    padding: '10px 12px',
    color: sortKey === key ? '#1a73e8' : '#5f6368',
    fontWeight: 500,
    cursor: 'pointer',
    userSelect: 'none',
    background: '#f8f9fa',
    borderBottom: '2px solid #e0e0e0',
    whiteSpace: 'nowrap',
  })

  return (
    <div>
      <TopBar title="Benefits & Documents" subtitle="UDID, NIDC, Aadhaar and documentation status" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="UDID Card Holders" value={stats.udid_holders}
            icon={FileCheck} color="#1a73e8"
            sub={`${((stats.udid_holders/stats.total)*100).toFixed(1)}% issued`}
            onClick={() => navigate('/beneficiary?udid=yes')} />
          <StatCard label="NIDC Card Holders" value={stats.nidc_holders}
            icon={CreditCard} color="#34a853"
            sub={`${((stats.nidc_holders/stats.total)*100).toFixed(1)}% issued`}
            onClick={() => navigate('/beneficiary?nidc=yes')} />
          <StatCard label="Aadhaar Linked" value={stats.aadhaar_linked}
            icon={ShieldCheck} color="#fbbc04"
            sub={`${((stats.aadhaar_linked/stats.total)*100).toFixed(1)}% linked`}
            onClick={() => navigate('/beneficiary?aad=yes')} />
          <StatCard label="Pending UDID" value={noUdid}
            icon={AlertCircle} color="#ea4335"
            sub="Require UDID enrollment"
            onClick={() => navigate('/beneficiary?udid=no')} />
        </div>

        {/* Action Priority Strip */}
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {priorityItems.map((item, i) => (
            <div key={i} style={{
              flex:1, minWidth:220, background:'#fff', borderRadius:10,
              border:`1px solid ${item.color}30`, borderLeft:`4px solid ${item.color}`,
              padding:'14px 16px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#202124' }}>{item.doc}</div>
                <span style={{
                  fontSize:10, fontWeight:600, color:item.color,
                  background:`${item.color}15`, padding:'2px 8px', borderRadius:10,
                }}>{item.urgency} Priority</span>
              </div>
              <div style={{ fontSize:22, fontWeight:700, color:item.color, margin:'6px 0 2px' }}>
                {item.pending.toLocaleString()} <span style={{ fontSize:13, fontWeight:400, color:'#5f6368' }}>pending ({item.pct}%)</span>
              </div>
              <div style={{ fontSize:11, color:'#9aa0a6' }}>{item.note}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div ref={coverageRef}>
            <ChartCard title="Document Coverage">
              <ProgressBar label="Aadhaar Linked" value={stats.aadhaar_linked} max={stats.total} color="#1a73e8" />
              <ProgressBar label="NIDC Card" value={stats.nidc_holders} max={stats.total} color="#34a853" />
              <ProgressBar label="UDID Card" value={stats.udid_holders} max={stats.total} color="#fbbc04" />
              <ProgressBar label="Voter ID (est.)" value={Math.round(stats.total * 0.72)} max={stats.total} color="#9334e6" />
              <ProgressBar label="Ration Card (est.)" value={Math.round(stats.total * 0.85)} max={stats.total} color="#00acc1" />
            </ChartCard>
          </div>

          <div ref={udidRef}>
            <ChartCard title="UDID Enrollment Status">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={udidData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={4}
                    label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    <Cell fill="#1a73e8" />
                    <Cell fill="#f1f3f4" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign:'center', marginTop:4 }}>
                <span style={{ fontSize:28, fontWeight:700, color:'#1a73e8' }}>
                  {((stats.udid_holders/stats.total)*100).toFixed(1)}%
                </span>
                <span style={{ fontSize:14, color:'#5f6368', marginLeft:8 }}>UDID Coverage</span>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Gap Analysis Chart */}
        <div ref={gapRef} style={{ marginBottom:16 }}>
          <ChartCard title="Document Gap Analysis — Issued vs Pending">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gapData} margin={{ top:20, right:16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:13, fill:'#5f6368' }} />
                <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
                <Bar dataKey="Issued" fill="#34a853" radius={[4,4,0,0]}>
                  <LabelList dataKey="Issued" position="top" style={{ fontSize:10, fill:'#5f6368', fontWeight:500 }} formatter={v => v.toLocaleString()} />
                </Bar>
                <Bar dataKey="Pending" fill="#ea4335" radius={[4,4,0,0]}>
                  <LabelList dataKey="Pending" position="top" style={{ fontSize:10, fill:'#5f6368', fontWeight:500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Aadhaar bar */}
        <div ref={aadhaarRef} style={{ marginBottom:16 }}>
          <ChartCard title="Aadhaar Linkage Status">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aadhaarData} margin={{ top:24, right:16 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#ea4335" />
                  <LabelList dataKey="value" position="top" style={{ fontSize: 12, fill: '#5f6368', fontWeight: 600 }} formatter={v => v.toLocaleString()} />
                </Bar>
                <Tooltip content={<CustomTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Sortable summary table */}
        <ChartCard title="Document Summary Table">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr>
                  <th style={thStyle('doc')} onClick={() => handleSort('doc')}>Document <SortIcon col="doc" sortKey={sortKey} sortDir={sortDir} /></th>
                  <th style={thStyle('issued')} onClick={() => handleSort('issued')}>Issued <SortIcon col="issued" sortKey={sortKey} sortDir={sortDir} /></th>
                  <th style={thStyle('pending')} onClick={() => handleSort('pending')}>Pending <SortIcon col="pending" sortKey={sortKey} sortDir={sortDir} /></th>
                  <th style={thStyle('pct')} onClick={() => handleSort('pct')}>Coverage% <SortIcon col="pct" sortKey={sortKey} sortDir={sortDir} /></th>
                  <th style={{ ...thStyle('bar'), textAlign:'left' }}>Coverage Bar</th>
                </tr>
              </thead>
              <tbody>
                {sortedTable.map((row, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #f0f0f0' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding:'9px 12px', color:'#202124', fontWeight:500 }}>{row.doc}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', color:'#34a853', fontWeight:600 }}>{row.issued.toLocaleString()}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', color:'#ea4335', fontWeight:600 }}>{row.pending.toLocaleString()}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:600 }}>{row.pct}%</td>
                    <td style={{ padding:'9px 12px', width:180 }}>
                      <div style={{ height:8, background:'#f1f3f4', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${row.pct}%`, background:'#1a73e8', borderRadius:4 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
