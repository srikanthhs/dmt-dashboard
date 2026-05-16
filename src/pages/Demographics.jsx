import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { Users, User, Heart, UserCheck, MapPin } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853','#9334e6','#00acc1']

const casteData = Object.entries(stats.caste).map(([n,v]) => ({ name:n, value:v }))
const maritalData = Object.entries(stats.marital)
  .filter(([,v]) => v > 20)
  .map(([n,v]) => ({ name:n, value:v }))
const ageData = Object.entries(stats.age_groups).map(([n,v]) => ({ name:n, value:v }))
const genderData = Object.entries(stats.gender).map(([n,v]) => ({ name:n, value:v }))
const areaData = Object.entries(stats.area_type).map(([n,v]) => ({ name:n, value:v }))

// Dependency ratio: (0-20 + 71+) / (21-70)
const dependents = (stats.age_groups['0-10'] + stats.age_groups['11-20'] +
  stats.age_groups['71-80'] + stats.age_groups['80+'])
const workingAge = stats.age_groups['21-30'] + stats.age_groups['31-40'] +
  stats.age_groups['41-50'] + stats.age_groups['51-60'] + stats.age_groups['61-70']
const dependencyRatio = Math.round((dependents / workingAge) * 100)

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
  const navigate = useNavigate()
  const genderRef = useRef()
  const casteRef = useRef()
  const maritalRef = useRef()
  const ageRef = useRef()

  return (
    <div>
      <TopBar title="Demographics" subtitle="Age, gender, caste and marital status" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="Male" value={stats.gender.Male} icon={User} color="#1a73e8" sub={`${((stats.gender.Male/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => navigate('/beneficiary?g=Male')} />
          <StatCard label="Female" value={stats.gender.Female} icon={User} color="#ea4335" sub={`${((stats.gender.Female/stats.total)*100).toFixed(1)}% of total`}
            onClick={() => navigate('/beneficiary?g=Female')} />
          <StatCard label="Scheduled Caste" value={stats.caste['Scheduled Caste']} icon={Users} color="#34a853" sub="Largest caste group"
            onClick={() => navigate('/beneficiary?caste=Scheduled Caste')} />
          <StatCard label="Married" value={stats.marital.Married} icon={Heart} color="#9334e6" sub="Marital status"
            onClick={() => navigate('/beneficiary?g=Male')} />
        </div>

        {/* Insight strip */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          <div style={{
            background:'#fff', borderRadius:10, padding:'16px 20px',
            border:'1px solid #1a73e830', borderLeft:'4px solid #1a73e8',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize:12, color:'#5f6368', marginBottom:4 }}>Dependency Ratio</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#1a73e8' }}>{dependencyRatio}<span style={{ fontSize:14, fontWeight:400, color:'#5f6368' }}> per 100</span></div>
            <div style={{ fontSize:11, color:'#9aa0a6', marginTop:4 }}>
              {dependents.toLocaleString()} dependents for {workingAge.toLocaleString()} working-age (21–70)
            </div>
          </div>
          <div style={{
            background:'#fff', borderRadius:10, padding:'16px 20px',
            border:'1px solid #34a85330', borderLeft:'4px solid #34a853',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize:12, color:'#5f6368', marginBottom:4 }}>Rural Population</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#34a853' }}>{((stats.area_type.Rural / (stats.area_type.Rural + stats.area_type.Urban))*100).toFixed(0)}<span style={{ fontSize:14, fontWeight:400, color:'#5f6368' }}>%</span></div>
            <div style={{ fontSize:11, color:'#9aa0a6', marginTop:4 }}>
              {stats.area_type.Rural.toLocaleString()} rural · {stats.area_type.Urban.toLocaleString()} urban
            </div>
          </div>
          <div style={{
            background:'#fff', borderRadius:10, padding:'16px 20px',
            border:'1px solid #9334e630', borderLeft:'4px solid #9334e6',
            boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize:12, color:'#5f6368', marginBottom:4 }}>Gender Ratio</div>
            <div style={{ fontSize:28, fontWeight:700, color:'#9334e6' }}>
              {Math.round((stats.gender.Female / stats.gender.Male) * 1000)}
              <span style={{ fontSize:14, fontWeight:400, color:'#5f6368' }}> F per 1000 M</span>
            </div>
            <div style={{ fontSize:11, color:'#9aa0a6', marginTop:4 }}>
              District avg: ~983 (Census 2011)
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div ref={ageRef}>
            <ChartCard title="Age Distribution">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ageData} margin={{ top:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize:12, fill:'#5f6368' }} />
                  <YAxis tick={{ fontSize:11, fill:'#5f6368' }} />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
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
            <ChartCard title="Gender & Area Breakdown">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, height:240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} cx="50%" cy="45%" outerRadius={75}
                      dataKey="value" paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false}>
                      {genderData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={areaData} cx="50%" cy="45%" outerRadius={75}
                      dataKey="value" paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false}>
                      <Cell fill="#34a853" />
                      <Cell fill="#1a73e8" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display:'flex', justifyContent:'space-around', marginTop:8 }}>
                <div style={{ fontSize:11, color:'#5f6368', textAlign:'center' }}>Gender Split</div>
                <div style={{ fontSize:11, color:'#5f6368', textAlign:'center' }}>Rural / Urban</div>
              </div>
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
                  <Tooltip content={<CustomTooltip />} cursor={false} />
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
                  <Tooltip content={<CustomTooltip />} cursor={false} />
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
