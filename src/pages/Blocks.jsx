import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import stats from '../data/stats'
import { useState } from 'react'
import { Map } from 'lucide-react'

const COLORS = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9334e6','#00acc1']
const BLOCKS = Object.keys(stats.blocks)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize:14, fontWeight:600, color:p.fill || '#202124' }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

const blockOverview = Object.entries(stats.blocks).map(([name, total], i) => ({
  name, total, color: COLORS[i]
}))

const stackedData = BLOCKS.map(block => {
  const disabs = stats.block_disability[block] || {}
  return { name: block, ...disabs }
})

const disabilityKeys = ['Locomotor Disability', 'Intellectual Disability', 'Hearing Impairment', 'Mental Illness', 'Blindness']

export default function Blocks() {
  const [selected, setSelected] = useState('Mayiladuthurai')
  const blockData = stats.block_disability[selected] || {}
  const blockTotal = stats.blocks[selected] || 0

  return (
    <div>
      <TopBar title="Block-wise Analysis" subtitle="Disability distribution across all 6 blocks" />
      <div style={{ padding:24 }}>

        {/* Block selector */}
        <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap' }}>
          {BLOCKS.map((b, i) => (
            <button key={b} onClick={() => setSelected(b)} style={{
              padding:'8px 20px', borderRadius:20, border:'none', cursor:'pointer',
              background: selected === b ? COLORS[i] : '#f1f3f4',
              color: selected === b ? '#fff' : '#3c4043',
              fontWeight: selected === b ? 600 : 400,
              fontSize: 13, transition:'all 0.15s',
            }}>
              {b}
            </button>
          ))}
        </div>

        {/* Selected block detail */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          <div style={{
            background:'#fff', borderRadius:10, padding:'16px 20px',
            border:'1px solid #f0f0f0', boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
            gridColumn:'1 / -1',
            display:'flex', alignItems:'center', gap:20,
          }}>
            <Map size={32} color="#1a73e8" />
            <div>
              <div style={{ fontFamily:"'Google Sans',sans-serif", fontSize:22, fontWeight:700, color:'#202124' }}>
                {selected}
              </div>
              <div style={{ fontSize:13, color:'#5f6368', marginTop:2 }}>
                {blockTotal.toLocaleString()} persons surveyed ·{' '}
                {((blockTotal / stats.total) * 100).toFixed(1)}% of district total
              </div>
            </div>
          </div>
          {Object.entries(blockData).map(([name, value], i) => (
            <div key={i} style={{
              background:'#fff', borderRadius:10, padding:'14px 16px',
              border:`1px solid ${COLORS[i]}30`, boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
              cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = COLORS[i] }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = `${COLORS[i]}30` }}
            >
              <div style={{ fontSize:11, color:'#5f6368', marginBottom:4 }}>{name}</div>
              <div style={{ fontSize:22, fontWeight:700, color: COLORS[i] }}>
                {value.toLocaleString()}
              </div>
              <div style={{ fontSize:11, color:'#9aa0a6', marginTop:2 }}>
                {((value / blockTotal) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* All blocks comparison */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Total Persons by Block">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={blockOverview} margin={{ top:20, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#5f6368' }} />
                <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[4,4,0,0]}>
                  {blockOverview.map((b, i) => (
                    <Cell key={i} fill={b.color} />
                  ))}
                  <LabelList dataKey="total" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Disability Types by Block (Stacked)">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stackedData} margin={{ top:0, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }} />
                <YAxis tick={{ fontSize:10, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:10, color:'#3c4043' }}>{v}</span>} />
                {disabilityKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} stackId="a" fill={COLORS[i]}
                    radius={i === disabilityKeys.length - 1 ? [3,3,0,0] : [0,0,0,0]}>
                    {i === disabilityKeys.length - 1 && (
                      <LabelList dataKey={key} position="top" style={{ fontSize: 9, fill: '#5f6368', fontWeight: 500 }}
                        formatter={(v, entry) => {
                          const row = stackedData.find(d => d.name === entry?.name)
                          if (!row) return ''
                          const total = disabilityKeys.reduce((s, k) => s + (row[k] || 0), 0)
                          return total.toLocaleString()
                        }} />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
