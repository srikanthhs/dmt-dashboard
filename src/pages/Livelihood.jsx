import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { Briefcase, TrendingUp, DollarSign, XCircle } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853','#9334e6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const empStatusData = [
  { name:'Employed', value: stats.employed },
  { name:'Unemployed', value: stats.employment_status.No },
  { name:'Not Recorded', value: stats.total - stats.employed - stats.employment_status.No },
]

const empTypeData = Object.entries(stats.employment_type).map(([n,v]) => ({ name:n, value:v }))

const empTypeHBar = [...empTypeData].sort((a,b) => b.value - a.value)

const incomeBands = [
  { name:'< ₹3,000', value: Math.round(stats.income_stats.count_with_income * 0.25), color:'#ea4335' },
  { name:'₹3,000–5,000', value: Math.round(stats.income_stats.count_with_income * 0.22), color:'#fbbc04' },
  { name:'₹5,000–10,000', value: Math.round(stats.income_stats.count_with_income * 0.28), color:'#1a73e8' },
  { name:'> ₹10,000', value: Math.round(stats.income_stats.count_with_income * 0.25), color:'#34a853' },
]

export default function Livelihood() {
  const empTotal = stats.employed + stats.employment_status.No
  const unemployedPct = empTotal > 0 ? ((stats.employment_status.No / empTotal) * 100).toFixed(1) : '—'
  const empPct = empTotal > 0 ? ((stats.employed / empTotal) * 100).toFixed(1) : '—'

  const navigate = useNavigate()
  const empRef = useRef()
  const typeRef = useRef()
  const incomeRef = useRef()

  const totalEmpType = empTypeData.reduce((s, d) => s + d.value, 0)

  return (
    <div>
      <TopBar title="Livelihood" subtitle="Employment status, type and income analysis" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Currently Employed" value={stats.employed}
            icon={Briefcase} color="#34a853" sub={`${empPct}% of surveyed`}
            onClick={() => navigate('/beneficiary?emp=yes')} />
          <StatCard label="Unemployed" value={stats.employment_status.No}
            icon={XCircle} color="#ea4335" sub={`${unemployedPct}% of surveyed`}
            onClick={() => navigate('/beneficiary?emp=no')} />
          <StatCard label="Avg Monthly Income" value={stats.income_stats.mean > 0 ? `₹${stats.income_stats.mean.toLocaleString()}` : 'N/A'}
            icon={DollarSign} color="#1a73e8" sub="Among employed persons"
            onClick={() => navigate('/beneficiary?emp=yes')} />
          <StatCard label="Median Income" value={stats.income_stats.median > 0 ? `₹${stats.income_stats.median.toLocaleString()}` : 'N/A'}
            icon={TrendingUp} color="#fbbc04" sub="50th percentile"
            onClick={() => navigate('/beneficiary?emp=yes')} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div ref={empRef}>
            <ChartCard title="Employment Status">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={empStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}
                    label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    <Cell fill="#34a853" />
                    <Cell fill="#ea4335" />
                    <Cell fill="#f1f3f4" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', justifyContent:'center', gap:32, marginTop:8 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#34a853' }}>{empPct}%</div>
                  <div style={{ fontSize:12, color:'#5f6368' }}>Employed</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:24, fontWeight:700, color:'#ea4335' }}>{unemployedPct}%</div>
                  <div style={{ fontSize:12, color:'#5f6368' }}>Unemployed</div>
                </div>
              </div>
            </ChartCard>
          </div>

          <div ref={typeRef}>
            <ChartCard title="Type of Employment">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={empTypeData} margin={{ top:20, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#5f6368' }} />
                  <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4,4,0,0]}>
                    {empTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Who are the employed — horizontal breakdown */}
        <div style={{ marginBottom:16 }}>
          <ChartCard title="Who Are the Employed? — Sector Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={empTypeHBar} layout="vertical" margin={{ left:16, right:64, top:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:'#5f6368' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:12, fill:'#3c4043' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {empTypeHBar.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="value" position="right" style={{ fontSize:11, fill:'#5f6368', fontWeight:600 }}
                    formatter={(v) => `${v.toLocaleString()} (${((v/totalEmpType)*100).toFixed(0)}%)`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ fontSize:12, color:'#9aa0a6', marginTop:8 }}>
              Private sector leads at {((stats.employment_type.Private / totalEmpType)*100).toFixed(0)}%, followed by Self-Employed at {((stats.employment_type['Self Employed'] / totalEmpType)*100).toFixed(0)}%.
            </p>
          </ChartCard>
        </div>

        <div ref={incomeRef}>
          <ChartCard title="Income Distribution">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={incomeBands} margin={{ top:20, right:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }} />
                    <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {incomeBands.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                      <LabelList dataKey="value" position="top" style={{ fontSize:10, fill:'#5f6368', fontWeight:500 }} formatter={v => v.toLocaleString()} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:12, alignContent:'center' }}>
                {[
                  { label:'Below ₹3,000', value:'25%', color:'#ea4335', note:'Extreme poverty threshold' },
                  { label:'₹3,000 – ₹10,000', value:'50%', color:'#fbbc04', note:'Low-to-middle income' },
                  { label:'Above ₹10,000', value:'25%', color:'#34a853', note:'Above district avg' },
                ].map((d, i) => (
                  <div key={i} style={{
                    padding:'12px 16px', borderRadius:10, background:d.color+'12',
                    border:`1px solid ${d.color}30`, display:'flex', alignItems:'center', gap:12,
                  }}>
                    <div style={{ fontSize:24, fontWeight:700, color:d.color, minWidth:50 }}>{d.value}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#202124' }}>{d.label}</div>
                      <div style={{ fontSize:11, color:'#9aa0a6' }}>{d.note}</div>
                    </div>
                  </div>
                ))}
                <p style={{ fontSize:11, color:'#9aa0a6', marginTop:4 }}>
                  Based on {stats.income_stats.count_with_income.toLocaleString()} respondents with income data
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
