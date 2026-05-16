import { useRef } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { Users, User, Heart, UserCheck } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853','#9334e6','#00acc1']

const casteData = Object.entries(stats.caste).map(([n,v]) => ({ name:n, value:v }))
const maritalData = Object.entries(stats.marital)
  .filter(([,v]) => v > 20)
  .map(([n,v]) => ({ name:n, value:v }))
const ageData = Object.entries(stats.age_groups).map(([n,v]) => ({ name:n, value:v }))
const genderData = Object.entries(stats.gender).map(([n,v]) => ({ name:n, value:v }))

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

export default function Demographics() {
  const genderRef = useRef()
  const casteRef = useRef()
  const maritalRef = useRef()
  const ageRef = useRef()

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div>
      <TopBar title="Demographics" subtitle="Age, gender, caste and marital status" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Male" value={stats.gender.Male} icon={User} color="#1a73e8" sub={`${((stats.gender.Male/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => scrollTo(genderRef)} />
          <StatCard label="Female" value={stats.gender.Female} icon={User} color="#ea4335" sub={`${((stats.gender.Female/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => scrollTo(genderRef)} />
          <StatCard label="Scheduled Caste" value={stats.caste['Scheduled Caste']} icon={Users} color="#34a853" sub="Largest caste group"
            onClick={() => scrollTo(casteRef)} />
          <StatCard label="Married" value={stats.marital.Married} icon={Heart} color="#9334e6" sub="Marital status"
            onClick={() => scrollTo(maritalRef)} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div ref={ageRef}>
            <ChartCard title="Age Distribution">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ageData} margin={{ top:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:12, fill:'#5f6368' }} />
                  <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#1a73e8" radius={[4,4,0,0]}>
                    {ageData.map((_, i) => (
                      <Cell key={i} fill={`hsl(${210 + i * 8}, 80%, ${45 + i * 3}%)`} />
                    ))}
                    <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div ref={genderRef}>
            <ChartCard title="Gender Breakdown">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={90}
                    dataKey="value" paddingAngle={3}
                    label={({ name, value, percent }) => `${name}: ${value.toLocaleString()} (${(percent*100).toFixed(0)}%)`}
                    labelLine={false}>
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div ref={casteRef}>
            <ChartCard title="Caste Distribution">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={casteData} layout="vertical" margin={{ left:8, right:56 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize:11, fill:'#5f6368' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'#5f6368' }} width={150} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {casteData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div ref={maritalRef}>
            <ChartCard title="Marital Status">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={maritalData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={3}
                    label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    {maritalData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  )
}
