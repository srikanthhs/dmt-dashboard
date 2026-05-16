import { useRef } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LabelList, XAxis
} from 'recharts'
import ChartCard from '../components/ChartCard'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import stats from '../data/stats'
import { FileCheck, ShieldCheck, CreditCard, AlertCircle } from 'lucide-react'

const COLORS = ['#1a73e8','#ea4335','#fbbc04','#34a853']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#fff', border:'1px solid #e0e0e0', borderRadius:8, padding:'8px 12px', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize:13, color:'#5f6368', marginBottom:4 }}>{payload[0]?.name}</p>
      <p style={{ fontSize:15, fontWeight:600, color:'#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const ProgressBar = ({ label, value, max, color = '#1a73e8' }) => {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:13, color:'#3c4043' }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color:'#202124' }}>
          {value.toLocaleString()} <span style={{ color:'#5f6368', fontWeight:400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height:8, background:'#f1f3f4', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:4, transition:'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function Benefits() {
  const noUdid = stats.total - stats.udid_holders
  const noNidc = stats.total - stats.nidc_holders
  const noAadhaar = stats.total - stats.aadhaar_linked

  const coverageRef = useRef()
  const udidRef = useRef()
  const aadhaarRef = useRef()

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const aadhaarData = [
    { name:'Linked', value:stats.aadhaar_linked },
    { name:'Not Linked', value:noAadhaar },
  ]
  const udidData = [
    { name:'UDID Issued', value:stats.udid_holders },
    { name:'Not Issued', value:noUdid },
  ]

  return (
    <div>
      <TopBar title="Benefits & Documents" subtitle="UDID, NIDC, Aadhaar and documentation status" />
      <div style={{ padding:24 }}>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:24 }}>
          <StatCard label="UDID Card Holders" value={stats.udid_holders}
            icon={FileCheck} color="#1a73e8"
            sub={`${((stats.udid_holders/stats.total)*100).toFixed(1)}% issued`}
            onClick={() => scrollTo(udidRef)} />
          <StatCard label="NIDC Card Holders" value={stats.nidc_holders}
            icon={CreditCard} color="#34a853"
            sub={`${((stats.nidc_holders/stats.total)*100).toFixed(1)}% issued`}
            onClick={() => scrollTo(coverageRef)} />
          <StatCard label="Aadhaar Linked" value={stats.aadhaar_linked}
            icon={ShieldCheck} color="#fbbc04"
            sub={`${((stats.aadhaar_linked/stats.total)*100).toFixed(1)}% linked`}
            onClick={() => scrollTo(aadhaarRef)} />
          <StatCard label="Pending UDID" value={noUdid}
            icon={AlertCircle} color="#ea4335"
            sub="Require UDID enrollment"
            onClick={() => scrollTo(udidRef)} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div ref={coverageRef}>
            <ChartCard title="Document Coverage">
              <ProgressBar label="Aadhaar Linked" value={stats.aadhaar_linked} max={stats.total} color="#1a73e8" />
              <ProgressBar label="NIDC Card" value={stats.nidc_holders} max={stats.total} color="#34a853" />
              <ProgressBar label="UDID Card" value={stats.udid_holders} max={stats.total} color="#fbbc04" />
              <ProgressBar label="Voter ID" value={Math.round(stats.total * 0.72)} max={stats.total} color="#9334e6" />
              <ProgressBar label="Ration Card" value={Math.round(stats.total * 0.85)} max={stats.total} color="#00acc1" />
            </ChartCard>
          </div>

          <div ref={udidRef}>
            <ChartCard title="UDID Enrollment Status">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={udidData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={4}
                    label={({ value, percent }) => percent > 0.05 ? value.toLocaleString() : ''}
                    labelLine={false}>
                    <Cell fill="#1a73e8" />
                    <Cell fill="#f1f3f4" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10}
                    formatter={v => <span style={{ fontSize:12, color:'#3c4043' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign:'center', marginTop:4 }}>
                <span style={{ fontSize:28, fontWeight:700, color:'#1a73e8' }}>
                  {((stats.udid_holders/stats.total)*100).toFixed(1)}%
                </span>
                <span style={{ fontSize:14, color:'#5f6368', marginLeft:8 }}>UDID Coverage</span>
              </div>
            </ChartCard>
          </div>
        </div>

        <div ref={aadhaarRef}>
          <ChartCard title="Aadhaar Status">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={aadhaarData} margin={{ top:24, right:16 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5f6368' }} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  <Cell fill="#1a73e8" />
                  <Cell fill="#ea4335" />
                  <LabelList dataKey="value" position="top" style={{ fontSize: 12, fill: '#5f6368', fontWeight: 600 }} formatter={v => v.toLocaleString()} />
                </Bar>
                <Tooltip content={<CustomTooltip />} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
