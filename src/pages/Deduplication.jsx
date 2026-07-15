import { useState, useEffect, useMemo } from 'react'
import {
  Copy, Download, AlertTriangle, CheckCircle2, Clock,
  FileWarning, Layers, ListChecks
} from 'lucide-react'
import TopBar from '../components/TopBar'

const DATASETS = [
  { key: 'beneficiaries', label: 'DAP Survey', url: '/beneficiaries.json', color: '#34a853' },
  { key: 'scooty', label: 'Scooty Scheme', url: '/scooty.json', color: '#1a73e8' },
  { key: 'mg', label: 'Marriage Assistance', url: '/mg.json', color: '#9334e6' },
  { key: 'scholarship', label: 'Scholarship', url: '/scholarship.json', color: '#1967d2' },
  { key: 'bankloan', label: 'Bank Loan Subsidy', url: '/bankloan.json', color: '#34a853' },
  { key: 'readers', label: 'Readers Allowance', url: '/readers.json', color: '#00acc1' },
  { key: 'udid_uncovered', label: 'UDID Not Covered', url: '/udid_uncovered.json', color: '#f9a825' },
]

const LABELS = {
  n: 'Name', father: 'Father', dob: 'DOB', age: 'Age', g: 'Gender', mob: 'Mobile',
  blk: 'Block', tal: 'Taluk', vil: 'Village', dist: 'District', pin: 'Pincode',
  udid: 'UDID', nidc: 'NIDC', aadhar: 'Aadhaar', dis: 'Disability', dpct: 'Disability %',
  caste: 'Caste', veh: 'Vehicle No', addr: 'Address',
}

function norm(v) {
  if (v === undefined || v === null) return ''
  const s = String(v).trim().toLowerCase()
  return (s === 'nan' || s === '-' || s === 'null') ? '' : s.replace(/\s+/g, ' ')
}

function completeness(r) {
  return Object.values(r).filter(v => norm(v) !== '').length
}

function buildClusters(records) {
  const n = records.length
  const parent = Array.from({ length: n }, (_, i) => i)
  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] } return x }
  function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb }

  const udidMap = new Map(), nidcMap = new Map(), aadharMap = new Map(), fbMap = new Map()

  records.forEach((r, i) => {
    const udid = norm(r.udid)
    const nidc = norm(r.nidc)
    const aadhar = norm(r.aadhar)
    const name = norm(r.n)
    const dob = norm(r.dob)
    const mob = norm(r.mob)
    const blk = norm(r.blk || r.tal)
    const dis = norm(r.dis)

    if (udid) { udidMap.has(udid) ? union(i, udidMap.get(udid)) : udidMap.set(udid, i) }
    if (nidc) { nidcMap.has(nidc) ? union(i, nidcMap.get(nidc)) : nidcMap.set(nidc, i) }
    if (aadhar) { aadharMap.has(aadhar) ? union(i, aadharMap.get(aadhar)) : aadharMap.set(aadhar, i) }

    let fb = null
    if (name && dob && mob) fb = `m:${name}|${dob}|${mob}`
    else if (name && dob && blk && dis) fb = `b:${name}|${dob}|${blk}|${dis}`
    else if (name && mob) fb = `n:${name}|${mob}`
    if (fb) { fbMap.has(fb) ? union(i, fbMap.get(fb)) : fbMap.set(fb, i) }
  })

  const groups = new Map()
  records.forEach((r, i) => {
    const root = find(i)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(i)
  })

  return Array.from(groups.values())
    .filter(idxs => idxs.length > 1)
    .map(idxs => {
      const recs = idxs.map(i => records[i])
      let suggested = 0, best = -1
      recs.forEach((r, i) => { const c = completeness(r); if (c > best) { best = c; suggested = i } })
      return { records: recs, suggested }
    })
}

function toCSV(rows, columns) {
  const esc = v => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [columns.join(','), ...rows.map(r => columns.map(c => esc(r[c])).join(','))].join('\n')
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function StatChip({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      flex: '1 1 140px', background: '#fff', borderRadius: 12, padding: '14px 16px',
      border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#202124' }}>{value}</div>
        <div style={{ fontSize: 11, color: '#5f6368' }}>{label}</div>
      </div>
    </div>
  )
}

function ClusterCard({ cluster, idx, keepIdx, onKeep }) {
  const keys = useMemo(() => {
    const set = new Set()
    cluster.records.forEach(r => Object.keys(r).forEach(k => { if (k !== 'src' && r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '') set.add(k) }))
    return Array.from(set)
  }, [cluster])

  const differing = useMemo(() => {
    const d = new Set()
    keys.forEach(k => {
      const vals = new Set(cluster.records.map(r => norm(r[k])))
      if (vals.size > 1) d.add(k)
    })
    return d
  }, [keys, cluster])

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 14, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', background: '#f8f9fa', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#3c4043' }}>Cluster #{idx + 1} · {cluster.records.length} copies</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 10px', color: '#9aa0a6', fontWeight: 600, whiteSpace: 'nowrap' }}>Keep</th>
              {keys.map(k => (
                <th key={k} style={{ textAlign: 'left', padding: '8px 10px', color: '#9aa0a6', fontWeight: 600, whiteSpace: 'nowrap' }}>{LABELS[k] || k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cluster.records.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f0f0f0', background: keepIdx === i ? '#e6f4ea' : 'transparent' }}>
                <td style={{ padding: '8px 10px' }}>
                  <input type="radio" checked={keepIdx === i} onChange={() => onKeep(i)} />
                </td>
                {keys.map(k => (
                  <td key={k} style={{
                    padding: '8px 10px', whiteSpace: 'nowrap', color: '#202124',
                    background: differing.has(k) ? '#fff8e1' : 'transparent',
                    fontWeight: differing.has(k) ? 600 : 400,
                  }}>
                    {r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== '' ? String(r[k]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PAGE_SIZE = 25

export default function Deduplication() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeKey, setActiveKey] = useState('beneficiaries')
  const [keepIndex, setKeepIndex] = useState({})
  const [resolved, setResolved] = useState({})
  const [shown, setShown] = useState(PAGE_SIZE)

  useEffect(() => {
    Promise.all(DATASETS.map(d => fetch(d.url).then(r => r.json()).then(records => [d.key, records])))
      .then(entries => { setData(Object.fromEntries(entries)); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const clustersByDataset = useMemo(() => {
    const result = {}
    for (const d of DATASETS) {
      if (data[d.key]) result[d.key] = buildClusters(data[d.key])
    }
    return result
  }, [data])

  useEffect(() => { setShown(PAGE_SIZE) }, [activeKey])

  const activeDs = DATASETS.find(d => d.key === activeKey)
  const activeRecords = data[activeKey] || []
  const activeClusters = clustersByDataset[activeKey] || []
  const redundant = activeClusters.reduce((sum, c) => sum + c.records.length - 1, 0)
  const resolvedCount = activeClusters.filter((_, i) => resolved[`${activeKey}:${i}`]).length

  const onKeep = (clusterIdx, recIdx) => {
    const key = `${activeKey}:${clusterIdx}`
    setKeepIndex(prev => ({ ...prev, [key]: recIdx }))
    setResolved(prev => ({ ...prev, [key]: true }))
  }

  const acceptAllSuggestions = () => {
    setKeepIndex(prev => {
      const next = { ...prev }
      activeClusters.forEach((c, i) => { next[`${activeKey}:${i}`] = c.suggested })
      return next
    })
    setResolved(prev => {
      const next = { ...prev }
      activeClusters.forEach((c, i) => { next[`${activeKey}:${i}`] = true })
      return next
    })
  }

  const exportCleaned = () => {
    const inCluster = new Set()
    activeClusters.forEach(c => c.records.forEach(r => inCluster.add(r)))
    const kept = activeClusters.map((c, i) => c.records[keepIndex[`${activeKey}:${i}`] ?? c.suggested])
    const uniqueRecords = activeRecords.filter(r => !inCluster.has(r))
    const cleaned = [...uniqueRecords, ...kept]
    downloadBlob(JSON.stringify(cleaned, null, 2), `${activeKey}_cleaned.json`, 'application/json')
  }

  const exportReport = () => {
    const rows = []
    activeClusters.forEach((c, ci) => {
      const chosen = keepIndex[`${activeKey}:${ci}`] ?? c.suggested
      c.records.forEach((r, ri) => {
        rows.push({
          cluster_id: ci + 1, dataset: activeKey, name: r.n || '', dob: r.dob || '',
          mobile: r.mob || '', udid: r.udid || '', nidc: r.nidc || '', aadhar: r.aadhar || '',
          block_taluk: r.blk || r.tal || '', village: r.vil || '', disability: r.dis || '',
          keep: ri === chosen ? 'KEEP' : 'REMOVE',
        })
      })
    })
    const csv = toCSV(rows, ['cluster_id', 'dataset', 'name', 'dob', 'mobile', 'udid', 'nidc', 'aadhar', 'block_taluk', 'village', 'disability', 'keep'])
    downloadBlob(csv, `${activeKey}_duplicate_report.csv`, 'text/csv')
  }

  return (
    <div>
      <TopBar title="Data Deduplication" subtitle="Review likely-duplicate records across all 7 datasets and export a cleaned copy — read-only, changes are not saved to the live site" />
      <div style={{ padding: 24 }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9aa0a6' }}>
            <Clock size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Loading all datasets…</div>
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: '#ea4335' }}>
            <AlertTriangle size={32} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>Failed to load data. Please refresh.</div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Dataset tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {DATASETS.map(d => {
                const clusters = clustersByDataset[d.key] || []
                const active = d.key === activeKey
                return (
                  <button
                    key={d.key}
                    onClick={() => setActiveKey(d.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                      border: active ? `2px solid ${d.color}` : '1px solid #e0e0e0',
                      background: active ? d.color + '12' : '#fff',
                      color: active ? d.color : '#3c4043',
                      fontWeight: active ? 700 : 500, fontSize: 13,
                    }}
                  >
                    {d.label}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 10,
                      background: clusters.length ? '#fce8e6' : '#e6f4ea',
                      color: clusters.length ? '#c62828' : '#137333',
                    }}>
                      {clusters.length}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Summary stats */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <StatChip icon={Layers} label="Records Scanned" value={activeRecords.length.toLocaleString()} color={activeDs?.color || '#1a73e8'} />
              <StatChip icon={Copy} label="Duplicate Clusters" value={activeClusters.length.toLocaleString()} color="#ea4335" />
              <StatChip icon={FileWarning} label="Redundant Records" value={redundant.toLocaleString()} color="#f9a825" />
              <StatChip icon={ListChecks} label="Resolved" value={`${resolvedCount} / ${activeClusters.length}`} color="#34a853" />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={acceptAllSuggestions} disabled={!activeClusters.length} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                border: '1px solid #e0e0e0', background: '#fff', color: '#3c4043', fontSize: 13, fontWeight: 600,
                cursor: activeClusters.length ? 'pointer' : 'not-allowed', opacity: activeClusters.length ? 1 : 0.5,
              }}>
                <CheckCircle2 size={15} /> Accept All Suggestions
              </button>
              <button onClick={exportCleaned} disabled={!activeRecords.length} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                border: 'none', background: '#1a73e8', color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: activeRecords.length ? 'pointer' : 'not-allowed',
              }}>
                <Download size={15} /> Export Cleaned Dataset
              </button>
              <button onClick={exportReport} disabled={!activeClusters.length} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
                border: '1px solid #ea433530', background: '#fce8e6', color: '#c62828', fontSize: 13, fontWeight: 600,
                cursor: activeClusters.length ? 'pointer' : 'not-allowed', opacity: activeClusters.length ? 1 : 0.5,
              }}>
                <Download size={15} /> Export Duplicate Report
              </button>
            </div>

            {/* Clusters */}
            {activeClusters.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#137333', background: '#e6f4ea', borderRadius: 12 }}>
                <CheckCircle2 size={36} style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600 }}>No duplicates detected in {activeDs?.label}</div>
                <div style={{ fontSize: 13, marginTop: 6, color: '#2e7d32' }}>This dataset is already clean.</div>
              </div>
            ) : (
              <>
                {activeClusters.slice(0, shown).map((c, i) => (
                  <ClusterCard
                    key={i}
                    cluster={c}
                    idx={i}
                    keepIdx={keepIndex[`${activeKey}:${i}`] ?? c.suggested}
                    onKeep={recIdx => onKeep(i, recIdx)}
                  />
                ))}
                {shown < activeClusters.length && (
                  <button onClick={() => setShown(s => s + PAGE_SIZE)} style={{
                    display: 'block', width: '100%', padding: '12px',
                    background: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: 10,
                    fontSize: 13, color: '#1a73e8', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Show more ({Math.min(PAGE_SIZE, activeClusters.length - shown)} of {activeClusters.length - shown} remaining)
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
