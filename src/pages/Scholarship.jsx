import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Legend, LabelList
} from 'recharts'
import SchemePage, { COLORS, CustomTooltip } from '../components/SchemePage'
import { Award, Users, FileCheck, CreditCard, ShieldCheck } from 'lucide-react'
import scholarshipStats from '../data/scholarshipStats'

const stats = scholarshipStats
const genderData = Object.entries(stats.by_gender || {}).map(([name, value]) => ({ name, value }))
const disData = Object.entries(stats.by_dis || {}).map(([name, value]) => ({ name, value }))
const pctData = Object.entries(stats.by_dis_pct || {})
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([name, value]) => ({ name, value }))

export default function Scholarship() {
  return (
    <SchemePage
      title="Scholarship"
      subtitle="Scholarship benefits disbursed to students with disabilities, 2025-2026"
      dataUrl="/scholarship.json"
      headerGradient="linear-gradient(135deg,#1a73e8,#4285f4)"
      statCards={[
        { label: 'Total Beneficiaries', value: stats.total, icon: Award, color: '#1a73e8' },
        { label: 'Male', value: stats.by_gender?.Male || 0, icon: Users, color: '#34a853' },
        { label: 'Female', value: stats.by_gender?.Female || 0, icon: Users, color: '#ea4335' },
        { label: 'UDID Verified', value: stats.udid, icon: FileCheck, color: '#9334e6', sub: `${((stats.udid / stats.total) * 100).toFixed(1)}% coverage` },
        { label: 'Aadhaar Recorded', value: stats.aadhaar, icon: ShieldCheck, color: '#fbbc04', sub: `${((stats.aadhaar / stats.total) * 100).toFixed(1)}% recorded` },
        { label: 'NIDC Verified', value: stats.nidc, icon: CreditCard, color: '#00acc1', sub: `${((stats.nidc / stats.total) * 100).toFixed(1)}% verified` },
      ]}
      charts={[
        {
          title: 'Gender Split', node: (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  dataKey="value" paddingAngle={4}
                  label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                  labelLine={false}>
                  {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? '#1a73e8' : '#ea4335'} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend iconType="circle" iconSize={10} formatter={v => <span style={{ fontSize: 12, color: '#3c4043' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )
        },
        {
          title: 'Disability Type', node: (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={disData} layout="vertical" margin={{ top: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {disData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="value" position="right" style={{ fontSize: 11, fill: '#5f6368', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
        {
          title: 'Disability Percentage Distribution', span2: true, node: (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pctData} margin={{ top: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" fill="#1a73e8" radius={[4, 4, 0, 0]}>
                  {pctData.map((_, i) => <Cell key={i} fill={`hsl(${210 + i * 8},75%,${50 + i}%)`} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
      ]}
      searchFields={['n', 'mob', 'aadhar', 'udid', 'nidc', 'cls']}
      searchPlaceholder={`Search by Name, Mobile, Aadhaar, UDID, NIDC, Class… (${stats.total} records)`}
      tableColumns={[
        { key: 'n', label: 'Name', render: r => <span style={{ fontWeight: 600, color: '#202124' }}>{r.n || '—'}</span> },
        { key: 'cls', label: 'Class' },
        { key: 'g', label: 'Gender/Age', render: r => `${r.age || ''}${r.age && r.g ? ' / ' : ''}${r.g || ''}` || '—' },
        { key: 'mob', label: 'Mobile' },
        { key: 'dis', label: 'Disability' },
        { key: 'amt', label: 'Amount', render: r => r.amt ? `₹${r.amt}` : '—' },
      ]}
      detailHeader={s => `${s.g || ''}${s.age ? `, Age ${s.age}` : ''} · ${s.cls || '—'}`}
      detailBadges={s => [
        s.dpct && <span key="dpct" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>{s.dpct} Disability</span>,
        s.aadhar && <span key="aad" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ Aadhaar</span>,
        s.udid && <span key="udid" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ UDID</span>,
      ].filter(Boolean)}
      detailSections={s => [
        { label: 'Identity & Documents', color: '#1a73e8', rows: [
          ['Aadhaar', s.aadhar || '—'], ['UDID Number', s.udid || '—'], ['NIDC Number', s.nidc || '—'], ['Mobile', s.mob || '—'],
        ]},
        { label: 'Bank Details', color: '#34a853', rows: [
          ['A/C Number', s.acc || '—'], ['IFSC', s.ifsc || '—'], ['Bank', s.bank || '—'],
        ]},
        { label: 'Disability', color: '#ea4335', rows: [
          ['Disability Type', s.dis || '—'], ['Disability %', s.dpct || '—'],
        ]},
        { label: 'Scholarship', color: '#fbbc04', rows: [
          ['Class', s.cls || '—'], ['Amount', s.amt ? `₹${s.amt}` : '—'], ['Application No', s.app_no || '—'], ['Caste', s.caste || '—'],
        ]},
        { label: 'Guardian / Address', color: '#ff7043', rows: [
          ['Father Name & Address', s.father || '—'],
        ]},
      ]}
    />
  )
}
