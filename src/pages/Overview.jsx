import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  Legend, XAxis, YAxis, CartesianGrid, LabelList
} from 'recharts'
import {
  Users, FileCheck, ShieldCheck, Briefcase,
  Activity, UserCheck
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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #e0e0e0',
      borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    }}>
      <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>
        {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const employed_pct = ((stats.employed / stats.total) * 100).toFixed(1)
  const udid_pct = ((stats.udid_holders / stats.total) * 100).toFixed(1)
  const aadhaar_pct = ((stats.aadhaar_linked / stats.total) * 100).toFixed(1)

  return (
    <div>
      <TopBar title="Overview" subtitle="Mayiladuthurai District · May 2026 Block-wise Master Data" />
      <div style={{ padding: '24px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <StatCard label="Total Persons Surveyed" value={stats.total}
            icon={Users} color="#1a73e8" sub="Across all 6 blocks"
            onClick={() => navigate('/demographics')} />
          <StatCard label="UDID Card Holders" value={stats.udid_holders}
            icon={FileCheck} color="#34a853" sub={`${udid_pct}% coverage`}
            onClick={() => navigate('/benefits')} />
          <StatCard label="Aadhaar Linked" value={stats.aadhaar_linked}
            icon={ShieldCheck} color="#fbbc04" sub={`${aadhaar_pct}% linked`}
            onClick={() => navigate('/benefits')} />
          <StatCard label="Currently Employed" value={stats.employed}
            icon={Briefcase} color="#ea4335" sub={`${employed_pct}% employment rate`}
            onClick={() => navigate('/livelihood')} />
          <StatCard label="NIDC Card Holders" value={stats.nidc_holders}
            icon={UserCheck} color="#9334e6" sub="National Identity Card"
            onClick={() => navigate('/benefits')} />
          <StatCard label="Permanent Disability" value={stats.permanent_disability}
            icon={Activity} color="#00acc1" sub="vs Temporary cases"
            onClick={() => navigate('/disability')} />
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
                  {disabilityTop.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <ChartCard title="Gender Distribution">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" paddingAngle={3}
                  label={({ name, value, percent }) => percent > 0.05 ? `${value.toLocaleString()}` : ''}
                  labelLine={false}>
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
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
      </div>
    </div>
  )
}
