import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LabelList,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import {
  Users, FileCheck, ShieldCheck, Briefcase,
  Activity, UserCheck, AlertCircle, TrendingDown, Home, Droplets
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import stats from '../data/stats'

const COLORS = ['#1a73e8', '#ea4335', '#fbbc04', '#34a853', '#9334e6', '#00acc1', '#ff7043', '#8d6e63']

const genderData = Object.entries(stats.gender).map(([name, value]) => ({ name, value }))
const blockData = Object.entries(stats.blocks).map(([name, value]) => ({ name, value }))
const disabilityTop = Object.entries(stats.disability_type)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .map(([name, value]) => ({ name: name.replace(' Disability', '').replace(' Impairment', ''), value }))
const ageData = Object.entries(stats.age_groups).map(([name, value]) => ({ name, value }))

const radarData = [
  { metric: 'Aadhaar', value: Math.round((stats.aadhaar_linked / stats.total) * 100) },
  { metric: 'NIDC Card', value: Math.round((stats.nidc_holders / stats.total) * 100) },
  { metric: 'UDID Card', value: Math.round((stats.udid_holders / stats.total) * 100) },
  { metric: 'Employed', value: Math.round((stats.employed / stats.total) * 100) },
  { metric: 'Own House', value: Math.round((stats.house_status.Own / stats.total) * 100) },
  { metric: 'Electricity', value: Math.round((stats.electricity.Yes / (stats.electricity.Yes + stats.electricity.No)) * 100) },
  { metric: 'Sanitation', value: Math.round((stats.toilet['Individual Toilet'] / stats.total) * 100) },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const insights = [
  {
    color: '#ea4335', icon: TrendingDown,
    label: 'Employment Crisis',
    value: `${((stats.employed / stats.total) * 100).toFixed(1)}%`,
    sub: `Only ${stats.employed.toLocaleString()} of ${stats.total.toLocaleString()} are employed`,
    filter: '/beneficiary?emp=no',
  },
  {
    color: '#fbbc04', icon: AlertCircle,
    label: 'UDID Gap',
    value: (stats.total - stats.udid_holders).toLocaleString(),
    sub: `${(((stats.total - stats.udid_holders) / stats.total) * 100).toFixed(1)}% still awaiting UDID card`,
    filter: '/beneficiary?udid=no',
  },
  {
    color: '#9334e6', icon: Home,
    label: 'Sanitation Gap',
    value: (stats.total - stats.toilet['Individual Toilet']).toLocaleString(),
    sub: `${(((stats.total - stats.toilet['Individual Toilet']) / stats.total) * 100).toFixed(1)}% lack individual toilet`,
    filter: '/beneficiary?toilet=Open Defecation',
  },
  {
    color: '#34a853', icon: ShieldCheck,
    label: 'Aadhaar Coverage',
    value: `${((stats.aadhaar_linked / stats.total) * 100).toFixed(1)}%`,
    sub: `${stats.aadhaar_linked.toLocaleString()} persons have Aadhaar linked`,
    filter: '/beneficiary?aad=yes',
  },
]

export default function Overview() {
  const navigate = useNavigate()
  const employed_pct = ((stats.employed / stats.total) * 100).toFixed(1)
  const udid_pct = ((stats.udid_holders / stats.total) * 100).toFixed(1)
  const aadhaar_pct = ((stats.aadhaar_linked / stats.total) * 100).toFixed(1)

  return (
    <div>
      <TopBar title="Overview" subtitle="Mayiladuthurai District · Survey Data Jan 2026" />
      <div style={{ padding: '24px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <StatCard label="Total Persons Surveyed" value={stats.total}
            icon={Users} color="#1a73e8" sub="Across all 6 blocks"
            onClick={() => navigate('/beneficiary')} />
          <StatCard label="UDID Card Holders" value={stats.udid_holders}
            icon={FileCheck} color="#34a853" sub={`${udid_pct}% coverage`}
            onClick={() => navigate('/beneficiary?udid=yes')} />
          <StatCard label="Aadhaar Linked" value={stats.aadhaar_linked}
            icon={ShieldCheck} color="#fbbc04" sub={`${aadhaar_pct}% linked`}
            onClick={() => navigate('/beneficiary?aad=yes')} />
          <StatCard label="Currently Employed" value={stats.employed}
            icon={Briefcase} color="#ea4335" sub={`${employed_pct}% employment rate`}
            onClick={() => navigate('/beneficiary?emp=yes')} />
          <StatCard label="NIDC Card Holders" value={stats.nidc_holders}
            icon={UserCheck} color="#9334e6" sub="National Identity Card"
            onClick={() => navigate('/beneficiary?nidc=yes')} />
          <StatCard label="Permanent Disability" value={stats.permanent_disability}
            icon={Activity} color="#00acc1" sub="vs Temporary cases"
            onClick={() => navigate('/beneficiary?nat=Permanent')} />
        </div>

        {/* Key Insights Strip */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          {insights.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} onClick={() => navigate(item.filter)} style={{
                flex: 1, minWidth: 200,
                background: item.color + '10',
                border: `1px solid ${item.color}30`,
                borderLeft: `4px solid ${item.color}`,
                borderRadius: 12, padding: '14px 18px',
                cursor: 'pointer', transition: 'box-shadow 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${item.color}30`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Icon size={16} color={item.color} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: item.color, marginBottom: 4, fontFamily: "'Google Sans',sans-serif" }}>
                  {item.value}
                </div>
                <div style={{ fontSize: 12, color: '#5f6368', lineHeight: 1.4 }}>{item.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <ChartCard title="Top Disability Types">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={disabilityTop} layout="vertical" margin={{ left: 0, right: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#5f6368' }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {disabilityTop.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Block-wise Distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={blockData} margin={{ top: 20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#1a73e8" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <ChartCard title="Gender Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                  labelLine={false}>
                  {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize: 12, color: '#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Age Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ageData} margin={{ top: 20, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#34a853" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: 9, fill: '#5f6368', fontWeight: 500 }} formatter={v => v.toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Urban vs Rural">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={Object.entries(stats.area_type).map(([name, value]) => ({ name, value }))}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                  labelLine={false}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#34a853" />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10}
                  formatter={v => <span style={{ fontSize: 12, color: '#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a73e8' }}>
                  {((stats.area_type.Rural / stats.total) * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: '#5f6368' }}>Rural</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#34a853' }}>
                  {((stats.area_type.Urban / stats.total) * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: '#5f6368' }}>Urban</div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Row 3: Welfare Coverage Radar + Quick Facts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ChartCard title="Welfare Coverage Radar" subtitle="% coverage across key welfare dimensions">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#9aa0a6' }}
                  tickFormatter={v => `${v}%`} />
                <Radar name="Coverage" dataKey="value" stroke="#1a73e8" fill="#1a73e8" fillOpacity={0.2}
                  dot={{ r: 4, fill: '#1a73e8' }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Coverage']} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#9aa0a6', marginTop: 4 }}>
              Low employment (7.5%) and UDID coverage (31.4%) are critical gaps
            </div>
          </ChartCard>

          <ChartCard title="Quick Facts" subtitle="Key numbers at a glance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
              {[
                { label: 'Persons with Permanent Disability', value: stats.permanent_disability.toLocaleString(), pct: `${((stats.permanent_disability/stats.total)*100).toFixed(1)}%`, color: '#ea4335', to: '/beneficiary?nat=Permanent' },
                { label: 'Working-age persons (21–60)', value: (['21-30','31-40','41-50','51-60'].reduce((s,k)=>s+stats.age_groups[k],0)).toLocaleString(), pct: `${((['21-30','31-40','41-50','51-60'].reduce((s,k)=>s+stats.age_groups[k],0)/stats.total)*100).toFixed(1)}%`, color: '#1a73e8', to: null },
                { label: 'Open defecation (no toilet)', value: stats.toilet['Open Defecation'].toLocaleString(), pct: `${((stats.toilet['Open Defecation']/stats.total)*100).toFixed(1)}%`, color: '#9334e6', to: '/beneficiary?toilet=Not Available' },
                { label: 'Kutcha / vulnerable housing', value: stats.house_type.Kutcha.toLocaleString(), pct: `${((stats.house_type.Kutcha/stats.total)*100).toFixed(1)}%`, color: '#ff7043', to: '/beneficiary?htype=Thatched' },
                { label: 'No electricity access', value: stats.electricity.No.toLocaleString(), pct: `${((stats.electricity.No/(stats.electricity.Yes+stats.electricity.No))*100).toFixed(1)}%`, color: '#fbbc04', to: '/beneficiary?elec=No' },
                { label: 'Government employees', value: stats.employment_type.Government.toLocaleString(), pct: `${((stats.employment_type.Government/stats.total)*100).toFixed(2)}%`, color: '#34a853', to: '/beneficiary?etype=Government' },
                { label: 'Widow / Deserted / Divorced', value: (stats.marital.Widow+(stats.marital.Deserted||0)+(stats.marital.Divorced||0)).toLocaleString(), pct: '', color: '#00acc1', to: '/beneficiary?mar=Widow' },
                { label: 'Scheduled Caste (SC)', value: stats.caste['Scheduled Caste'].toLocaleString(), pct: `${((stats.caste['Scheduled Caste']/stats.total)*100).toFixed(1)}%`, color: '#8d6e63', to: '/beneficiary?caste=Scheduled Caste' },
              ].map((item, i) => (
                <div key={i} onClick={() => item.to && navigate(item.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '6px 0', borderBottom: '1px solid #f8f9fa',
                    cursor: item.to ? 'pointer' : 'default',
                    borderRadius: 4, transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (item.to) e.currentTarget.style.background = '#f8f9fa' }}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 13, color: '#3c4043' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#202124' }}>{item.value}</div>
                  {item.pct && <div style={{ fontSize: 11, color: '#9aa0a6', minWidth: 40, textAlign: 'right' }}>{item.pct}</div>}
                  {item.to && <div style={{ fontSize: 10, color: '#1a73e8', opacity: 0.6 }}>→</div>}
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
