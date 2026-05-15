import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { Home, Droplets, Zap, Wind } from 'lucide-react'

const COLORS = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9334e6','#00acc1']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const houseStatusData = Object.entries(stats.house_status).map(([n,v]) => ({ name:n, value:v }))
const houseTypeData = Object.entries(stats.house_type).map(([n,v]) => ({ name:n, value:v }))
const waterData = Object.entries(stats.water).map(([n,v]) => ({ name:n, value:v }))
const toiletData = Object.entries(stats.toilet).map(([n,v]) => ({ name:n, value:v }))

export default function Infrastructure() {
  const elecPct = ((stats.electricity.Yes / (stats.electricity.Yes + stats.electricity.No)) * 100).toFixed(1)

  return (
    <div>
      <TopBar title="Infrastructure" subtitle="Housing, water, electricity and sanitation" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Own House" value={stats.house_status.Own}
            icon={Home} color="#1a73e8" sub="Ownership status" />
          <StatCard label="Electricity Access" value={stats.electricity.Yes}
            icon={Zap} color="#fbbc04" sub={`${elecPct}% coverage`} />
          <StatCard label="Tap Water Access" value={stats.water['Tap Water']}
            icon={Droplets} color="#34a853" sub="Primary water source" />
          <StatCard label="Individual Toilet" value={stats.toilet['Individual Toilet']}
            icon={Wind} color="#9334e6" sub="Sanitation access" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <ChartCard title="House Ownership">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={houseStatusData} cx="50%" cy="50%" outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {houseStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="House Type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={houseTypeData} margin={{ top:0, right:8 }}>
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {houseTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
                <Tooltip content={<CustomTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <ChartCard title="Source of Drinking Water">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={waterData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {waterData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:11, color:'#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Toilet Facility">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={toiletData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}>
                  <Cell fill="#34a853" />
                  <Cell fill="#1a73e8" />
                  <Cell fill="#ea4335" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize:11, color:'#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
