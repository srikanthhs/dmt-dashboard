import {
  BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, LabelList
} from 'recharts'
import SchemePage, { COLORS, CustomTooltip } from '../components/SchemePage'
import { HeartHandshake, Users, Activity, Map } from 'lucide-react'
import mgStats from '../data/mgStats'

const stats = mgStats
const disData = Object.entries(stats.by_dis || {}).map(([name, value]) => ({ name, value }))
const geoData = Object.entries(stats.by_geo || {}).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }))
const topDis = disData[0]?.name

export default function MarriageAssistance() {
  return (
    <SchemePage
      title="Maintenance Grant"
      subtitle="Maintenance grant disbursed to persons with disabilities"
      dataUrl="/mg.json"
      headerGradient="linear-gradient(135deg,#9334e6,#c158dc)"
      statCards={[
        { label: 'Total Beneficiaries', value: stats.total, icon: HeartHandshake, color: '#9334e6' },
        { label: topDis || 'Top Disability', value: stats.by_dis?.[topDis] || 0, icon: Activity, color: '#1a73e8', sub: topDis, filter: topDis ? { dis: topDis } : undefined },
        { label: 'Taluks Covered', value: Object.keys(stats.by_geo || {}).length, icon: Map, color: '#34a853' },
        { label: 'Records with Mobile', value: 'n/a', icon: Users, color: '#fbbc04', sub: 'not tracked in this list' },
      ]}
      charts={[
        {
          title: 'Disability Type Distribution', node: (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={disData} margin={{ top: 24, right: 8 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5f6368' }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#5f6368' }} />
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
          title: 'Taluk-wise Distribution', node: (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={geoData} margin={{ top: 24, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <YAxis tick={{ fontSize: 11, fill: '#5f6368' }} />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {geoData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  <LabelList dataKey="value" position="top" style={{ fontSize: 11, fill: '#5f6368', fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
      ]}
      searchFields={['n', 'mob', 'dist', 'tal']}
      searchPlaceholder={`Search by Name, Mobile, District, Taluk… (${stats.total} records)`}
      tableColumns={[
        { key: 'n', label: 'Name', render: r => <span style={{ fontWeight: 600, color: '#202124' }}>{r.n || '—'}</span> },
        { key: 'mob', label: 'Mobile' },
        { key: 'dist', label: 'District' },
        { key: 'tal', label: 'Taluk' },
        { key: 'dis', label: 'Disability Type' },
      ]}
      detailHeader={s => s.tal || s.dist || ''}
      detailBadges={s => s.dis ? [<span key="dis" style={{ background: 'rgba(255,255,255,0.25)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 12 }}>{s.dis}</span>] : []}
      detailSections={s => [
        { label: 'Contact', color: '#9334e6', rows: [['Mobile', s.mob || '—']] },
        { label: 'Location', color: '#34a853', rows: [['District', s.dist || '—'], ['Taluk', s.tal || '—']] },
        { label: 'Disability', color: '#ea4335', rows: [['Disability Type', s.dis || '—']] },
      ]}
    />
  )
}
