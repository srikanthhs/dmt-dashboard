import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Legend, LabelList
} from 'recharts'
import SchemePage, { COLORS, CustomTooltip } from '../components/SchemePage'
import { Landmark, Users, FileCheck, CreditCard, ShieldCheck } from 'lucide-react'
import bankloanStats from '../data/bankloanStats'

const stats = bankloanStats
const genderData = Object.entries(stats.by_gender || {}).map(([name, value]) => ({ name, value }))
const disData = Object.entries(stats.by_dis || {}).map(([name, value]) => ({ name, value }))
const pctData = Object.entries(stats.by_dis_pct || {})
  .sort(([a], [b]) => parseInt(a) - parseInt(b))
  .map(([name, value]) => ({ name, value }))

export default function BankLoan() {
  return (
    <SchemePage
      title="Bank Loan Subsidy"
      subtitle="Bank loan subsidy beneficiaries for self-employment, 2025-2026"
      dataUrl="/bankloan.json"
      headerGradient="linear-gradient(135deg,#34a853,#66bb6a)"
      statCards={[
        { label: 'Total Beneficiaries', value: stats.total, icon: Landmark, color: '#34a853' },
        { label: 'Male', value: stats.by_gender?.Male || 0, icon: Users, color: '#1a73e8' },
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
                <Bar dataKey="value" fill="#34a853" radius={[4, 4, 0, 0]}>
                  {pctData.map((_, i) => <Cell key={i} fill={`hsl(${140 - i * 4},60%,${45 + i}%)`} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 10, fill: '#5f6368', fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
      ]}
      searchFields={['n', 'mob', 'aadhar', 'udid', 'nidc', 'business']}
      searchPlaceholder={`Search by Name, Mobile, Aadhaar, UDID, NIDC, Business… (${stats.total} records)`}
      tableColumns={[
        { key: 'n', label: 'Name', render: r => <span style={{ fontWeight: 600, color: '#202124' }}>{r.n || '—'}</span> },
        { key: 'g', label: 'Age/Gender', render: r => `${r.age || ''}${r.age && r.g ? ' / ' : ''}${r.g || ''}` || '—' },
        { key: 'mob', label: 'Mobile' },
        { key: 'business', label: 'Business' },
        { key: 'loan_amt', label: 'Loan Amount', render: r => r.loan_amt ? `₹${r.loan_amt}` : '—' },
        { key: 'subsidy_amt', label: 'Subsidy', render: r => r.subsidy_amt ? `₹${r.subsidy_amt}` : '—' },
      ]}
      detailHeader={s => `${s.g || ''}${s.age ? `, Age ${s.age}` : ''} · ${s.business || '—'}`}
      detailBadges={s => [
        s.dpct && <span key="dpct" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>{s.dpct} Disability</span>,
        s.aadhar && <span key="aad" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ Aadhaar</span>,
        s.udid && <span key="udid" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ UDID</span>,
      ].filter(Boolean)}
      detailSections={s => [
        { label: 'Identity & Documents', color: '#1a73e8', rows: [
          ['Aadhaar', s.aadhar || '—'], ['UDID Number', s.udid || '—'], ['NIDC Number', s.nidc || '—'], ['Mobile', s.mob || '—'],
        ]},
        { label: 'Loan Details', color: '#34a853', rows: [
          ['Bank', s.bank || '—'], ['Branch', s.branch || '—'], ['Business', s.business || '—'],
          ['Loan Amount', s.loan_amt ? `₹${s.loan_amt}` : '—'], ['Subsidy Amount', s.subsidy_amt ? `₹${s.subsidy_amt}` : '—'],
          ['Application No', s.app_no || '—'], ['Application Date', s.app_date || '—'],
        ]},
        { label: 'Disability', color: '#ea4335', rows: [
          ['Disability Type', s.dis || '—'], ['Disability %', s.dpct || '—'],
        ]},
        { label: 'Address', color: '#ff7043', rows: [
          ['Address', s.addr || '—'], ['Caste', s.caste || '—'],
        ]},
      ]}
    />
  )
}
