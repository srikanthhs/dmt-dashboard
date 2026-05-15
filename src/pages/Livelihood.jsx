import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, XAxis, YAxis, CartesianGrid
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

export default function Livelihood() {
  const unemployedPct = ((stats.employment_status.No / (stats.employed + stats.employment_status.No)) * 100).toFixed(1)
  const empPct = ((stats.employed / (stats.employed + stats.employment_status.No)) * 100).toFixed(1)

  return (
    <div>
      <TopBar title="Livelihood" subtitle="Employment status, type and income analysis" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Currently Employed" value={stats.employed}
            icon={Briefcase} color="#34a853" sub={`${empPct}% of surveyed`} />
          <StatCard label="Unemployed" value={stats.employment_status.No}
            icon={XCircle} color="#ea4335" sub={`${unemployedPct}% of surveyed`} />
          <StatCard label="Avg Monthly Income" value={`₹${stats.income_stats.mean.toLocaleString()}`}
            icon={DollarSign} color="#1a73e8" sub="Among employed persons" />
          <StatCard label="Median Income" value={`₹${stats.income_stats.median.toLocaleString()}`}
            icon={TrendingUp} color="#fbbc04" sub="50th percentile" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <ChartCard title="Employment Status">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={empStatusData.filter(d => d.value > 0)} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
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

          <ChartCard title="Type of Employment">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={empTypeData} margin={{ top:0, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#5f6368' }} />
                <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {empTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Income distribution */}
        <ChartCard title="Income Summary">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, padding:'8px 0' }}>
            {[
              { label:'Below ₹3,000', value:'25%', color:'#ea4335' },
              { label:'₹3,000 – ₹10,000', value:'50%', color:'#fbbc04' },
              { label:'Above ₹10,000', value:'25%', color:'#34a853' },
            ].map((d, i) => (
              <div key={i} style={{
                padding:20, borderRadius:10, background:d.color+'12',
                border:`1px solid ${d.color}30`, textAlign:'center'
              }}>
                <div style={{ fontSize:28, fontWeight:700, color:d.color }}>{d.value}</div>
                <div style={{ fontSize:12, color:'#5f6368', marginTop:4 }}>{d.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:'#9aa0a6', marginTop:12 }}>
            Based on {stats.income_stats.count_with_income.toLocaleString()} respondents with income data
          </p>
        </ChartCard>
      </div>
    </div>
  )
}
