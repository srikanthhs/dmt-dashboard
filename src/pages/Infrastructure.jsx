import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LabelList, XAxis
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
  const navigate = useNavigate()
  const elecTotal = stats.electricity.Yes + stats.electricity.No
  const elecPct = elecTotal > 0 ? ((stats.electricity.Yes / elecTotal) * 100).toFixed(1) : '—'

  const houseRef = useRef()
  const waterRef = useRef()
  const toiletRef = useRef()

  return (
    <div>
      <TopBar title="Infrastructure" subtitle="Housing, water, electricity and sanitation" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Own House" value={stats.house_status.Own}
            icon={Home} color="#1a73e8" sub="Ownership status"
            onClick={() => navigate('/beneficiary?hstat=Own')} />
          <StatCard label="Electricity Access" value={stats.electricity.Yes}
            icon={Zap} color="#fbbc04" sub={`${elecPct}% coverage`}
            onClick={() => navigate('/beneficiary?elec=Yes')} />
          <StatCard label="Tap Water Access" value={stats.water['Tap Water']}
            icon={Droplets} color="#34a853" sub="Primary water source"
            onClick={() => navigate('/beneficiary?water=Tap water inside the house')} />
          <StatCard label="Individual Toilet" value={stats.toilet['Individual Toilet']}
            icon={Wind} color="#9334e6" sub="Sanitation access"
            onClick={() => navigate('/beneficiary?toilet=Own')} />
        </div>

        <div ref={houseRef} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <ChartCard title="House Ownership">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={houseStatusData} cx="50%" cy="50%" outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ name, value, percent }) => percent > 0.05 ? `${name}: ${value.toLocaleString()}` : ''}
                  labelLine={false}>
                  {houseStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="House Type">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={houseTypeData} margin={{ top:20, right:8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Bar dataKey="value" radius={[4,4,0,0]}>
                  {houseTypeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div ref={waterRef}>
            <ChartCard title="Source of Drinking Water">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={waterData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                    dataKey="value" paddingAngle={3}
                    label={({ value, percent }) => percent > 0.08 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    {waterData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:11, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div ref={toiletRef}>
            <ChartCard title="Toilet Facility">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={toiletData} cx="50%" cy="50%" innerRadius={50} outerRadius={85}
                    dataKey="value" paddingAngle={3}
                    label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    <Cell fill="#34a853" />
                    <Cell fill="#1a73e8" />
                    <Cell fill="#ea4335" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:11, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}
