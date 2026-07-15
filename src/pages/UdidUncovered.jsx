import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, LabelList
} from 'recharts'
import SchemePage, { CustomTooltip } from '../components/SchemePage'
import { ShieldAlert, Map, FileCheck, Users } from 'lucide-react'
import udidUncoveredStats from '../data/udidUncoveredStats'

const stats = udidUncoveredStats
const geoData = Object.entries(stats.by_geo || {}).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }))

export default function UdidUncovered() {
  return (
    <SchemePage
      title="UDID Not Yet Covered"
      subtitle="UDID cardholders not yet linked to any scheme benefit — outreach gap list"
      dataUrl="/udid_uncovered.json"
      headerGradient="linear-gradient(135deg,#f9a825,#fb8c00)"
      statCards={[
        { label: 'People in Gap List', value: stats.total, icon: ShieldAlert, color: '#f9a825' },
        { label: 'UDID Already Held', value: stats.udid, icon: FileCheck, color: '#34a853', sub: `${((stats.udid / stats.total) * 100).toFixed(1)}% of list` },
        { label: 'Taluks Covered', value: Object.keys(stats.by_geo || {}).length, icon: Map, color: '#1a73e8' },
        { label: 'No Scheme Benefit on Record', value: stats.total, icon: Users, color: '#ea4335', sub: 'candidates for outreach' },
      ]}
      charts={[
        {
          title: 'Taluk-wise Distribution', span2: true, node: (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={geoData} margin={{ top: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" fill="#f9a825" radius={[6, 6, 0, 0]}>
                  {geoData.map((_, i) => <Cell key={i} fill={`hsl(${38 + i * 4},85%,${50 + i}%)`} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: '#5f6368', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
      ]}
      searchFields={['n', 'father', 'mob', 'udid', 'vil', 'tal']}
      searchPlaceholder={`Search by Name, Father Name, Mobile, UDID, Village, Taluk… (${stats.total} records)`}
      tableColumns={[
        { key: 'n', label: 'Name', render: r => <span style={{ fontWeight: 600, color: '#202124' }}>{r.n || '—'}</span> },
        { key: 'father', label: 'Father Name' },
        { key: 'dob', label: 'DOB' },
        { key: 'mob', label: 'Mobile' },
        { key: 'tal', label: 'Taluk / Village', render: r => [r.tal, r.vil].filter(Boolean).join(' / ') || '—' },
        { key: 'udid', label: 'UDID', render: r => r.udid
          ? <span style={{ background: '#fff3e0', color: '#e65100', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 500 }}>{r.udid.slice(-8)}</span>
          : <span style={{ color: '#9aa0a6' }}>—</span> },
      ]}
      detailHeader={s => [s.tal, s.vil, s.dist].filter(Boolean).join(' · ')}
      detailBadges={s => [
        <span key="gap" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 12 }}>⚠ No Scheme Benefit</span>,
        s.udid && <span key="udid" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 12, padding: '3px 12px', borderRadius: 12 }}>✓ Has UDID</span>,
      ].filter(Boolean)}
      detailSections={s => [
        { label: 'Identity', color: '#f9a825', rows: [
          ['Father Name', s.father || '—'], ['Date of Birth', s.dob || '—'], ['Mobile', s.mob || '—'], ['UDID Number', s.udid || '—'],
        ]},
        { label: 'Location', color: '#1a73e8', rows: [
          ['District', s.dist || '—'], ['Taluk', s.tal || '—'], ['Village', s.vil || '—'], ['Pincode', s.pin || '—'],
        ]},
        { label: 'Address', color: '#ff7043', rows: [
          ['Address', s.addr || '—'],
        ]},
      ]}
    />
  )
}
