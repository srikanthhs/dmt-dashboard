import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, FunnelChart, Funnel, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { GraduationCap, BookOpen, Award, School } from 'lucide-react'

const COLORS = ['#1a73e8','#1565c0','#1976d2','#1e88e5','#2196f3','#42a5f5','#64b5f6','#90caf9','#bbdefb','#e3f2fd','#f5f5f5','#eeeeee']

const eduData = Object.entries(stats.education)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value], i) => ({ name, value, pct: ((value / stats.total) * 100).toFixed(1) }))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export default function Education() {
  const higherEdu = (stats.education['Under Graduate'] || 0) +
    (stats.education['Post Graduate'] || 0) + (stats.education['Ph.D'] || 0) +
    (stats.education['Diploma'] || 0)
  const noFormal = stats.education['No Formal Education'] || 0
  const primary = (stats.education['Upto 5th Std'] || 0) + (stats.education['Below 5th Std'] || 0)

  return (
    <div>
      <TopBar title="Education" subtitle="Educational attainment of differently-abled persons" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Higher Education" value={higherEdu}
            icon={GraduationCap} color="#1a73e8"
            sub={`${((higherEdu/stats.total)*100).toFixed(1)}% of total`} />
          <StatCard label="No Formal Education" value={noFormal}
            icon={BookOpen} color="#ea4335"
            sub={`${((noFormal/stats.total)*100).toFixed(1)}% of total`} />
          <StatCard label="Primary Level" value={primary}
            icon={School} color="#fbbc04"
            sub="Up to 5th standard" />
          <StatCard label="Ph.D Holders" value={stats.education['Ph.D'] || 16}
            icon={Award} color="#34a853"
            sub="Highest qualification" />
        </div>

        <ChartCard title="Education Level Distribution" style={{ marginBottom:16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eduData} margin={{ left:8, right:16, bottom:20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }}
                angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {eduData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Education Breakdown">
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8f9fa', borderBottom:'2px solid #e0e0e0' }}>
                  <th style={{ textAlign:'left', padding:'10px 12px', color:'#5f6368', fontWeight:500 }}>Level</th>
                  <th style={{ textAlign:'right', padding:'10px 12px', color:'#5f6368', fontWeight:500 }}>Count</th>
                  <th style={{ textAlign:'right', padding:'10px 12px', color:'#5f6368', fontWeight:500 }}>Percentage</th>
                  <th style={{ padding:'10px 12px', color:'#5f6368', fontWeight:500 }}>Distribution</th>
                </tr>
              </thead>
              <tbody>
                {eduData.map((d, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #f0f0f0' }}>
                    <td style={{ padding:'9px 12px', color:'#202124' }}>{d.name}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', fontWeight:500 }}>{d.value.toLocaleString()}</td>
                    <td style={{ padding:'9px 12px', textAlign:'right', color:'#5f6368' }}>{d.pct}%</td>
                    <td style={{ padding:'9px 12px', width:200 }}>
                      <div style={{ height:6, background:'#f1f3f4', borderRadius:3, overflow:'hidden' }}>
                        <div style={{
                          height:'100%', width:`${d.pct}%`,
                          background: COLORS[i % COLORS.length], borderRadius:3
                        }} />
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
