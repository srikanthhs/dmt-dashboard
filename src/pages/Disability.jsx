import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid,
  PolarAngleAxis
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export default function Disability() {
  const top1 = disabilityData[0]
  const top2 = disabilityData[1]

  return (
    <div>
      <TopBar title="Disability Analysis" subtitle="Types, nature and distribution of disabilities" />
      <div style={{ padding: 24 }}>

        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Most Common Disability" value={top1.value}
            icon={Activity} color="#1a73e8" sub={top1.name} />
          <StatCard label="Permanent Cases" value={stats.permanent_disability}
            icon={Zap} color="#ea4335" sub="Nature of disability" />
          <StatCard label="Hearing Impairment" value={stats.disability_type['Hearing Impairment']}
            icon={Heart} color="#34a853" sub="Type 9" />
          <StatCard label="Visual Impairment" value={(stats.disability_type['Blindness'] || 0) + (stats.disability_type['Low Vision'] || 0)}
            icon={Eye} color="#fbbc04" sub="Blindness + Low Vision" />
        </div>

        {/* Full disability type table */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <ChartCard title="All Disability Types" style={{ gridColumn:'1 / -1' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={disabilityData} margin={{ left:8, right:16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }}
                  angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {disabilityData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Permanent vs Temporary">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={natureData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={4}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#fbbc04" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', justifyContent:'center', gap:32, marginTop:8 }}>
              {natureData.map((d, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:i===0?'#1a73e8':'#fbbc04' }}>
                    {((d.value / stats.total) * 100).toFixed(1)}%
                  </div>
                  <div style={{ fontSize:12, color:'#5f6368' }}>{d.name}</div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Table breakdown */}
          <ChartCard title="Disability Breakdown Table">
            <div style={{ overflowY:'auto', maxHeight:280 }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #f0f0f0' }}>
                    <th style={{ textAlign:'left', padding:'6px 8px', color:'#5f6368', fontWeight:500 }}>Type</th>
                    <th style={{ textAlign:'right', padding:'6px 8px', color:'#5f6368', fontWeight:500 }}>Count</th>
                    <th style={{ textAlign:'right', padding:'6px 8px', color:'#5f6368', fontWeight:500 }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {disabilityData.map((d, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid #f8f9fa' }}>
                      <td style={{ padding:'7px 8px', color:'#202124' }}>
                        <span style={{
                          display:'inline-block', width:10, height:10,
                          borderRadius:'50%', background:COLORS[i%COLORS.length],
                          marginRight:8
                        }} />
                        {d.name}
                      </td>
                      <td style={{ padding:'7px 8px', textAlign:'right', fontWeight:500, color:'#202124' }}>
                        {d.value.toLocaleString()}
                      </td>
                      <td style={{ padding:'7px 8px', textAlign:'right', color:'#5f6368' }}>
                        {d.pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
