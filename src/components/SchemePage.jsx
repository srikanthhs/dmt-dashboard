import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ChartCard from './ChartCard'
import TopBar from './TopBar'
import StatCard from './StatCard'
import { Search, X, ChevronRight } from 'lucide-react'

export const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9334e6', '#00acc1']

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
      <p style={{ fontSize: 13, color: '#5f6368', marginBottom: 4 }}>{label || payload[0]?.name}</p>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#202124' }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  )
}

const cache = {}

/**
 * Generic scheme page: stat cards + chart row(s) + searchable/sortable table + detail modal.
 * Mirrors the layout originally hand-built in src/pages/Scooty.jsx.
 */
export default function SchemePage({
  title, subtitle, dataUrl, headerGradient = 'linear-gradient(135deg,#1a73e8,#4285f4)',
  statCards = [], charts = [],
  searchFields = ['n'], searchPlaceholder = 'Search by Name…',
  tableColumns = [], defaultSortKey = 'n',
  detailHeader, detailBadges, detailSections = () => [],
  emptyIcon: EmptyIcon,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState('asc')
  const dataRef = useRef(null)
  const navigate = useNavigate()

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sortedResults = [...results].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span style={{ color: '#d0d0d0', fontSize: 10 }}> ⇅</span>
    return <span style={{ color: '#1a73e8', fontSize: 10 }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
  }

  const thStyle = (key) => ({
    textAlign: 'left', padding: '9px 10px',
    color: sortKey === key ? '#1a73e8' : '#5f6368',
    fontWeight: 500, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  })

  useEffect(() => {
    if (cache[dataUrl]) { dataRef.current = cache[dataUrl]; setLoaded(true); return }
    fetch(dataUrl).then(r => r.json()).then(d => {
      cache[dataUrl] = d; dataRef.current = d; setLoaded(true)
    })
  }, [dataUrl])

  useEffect(() => {
    if (!query || query.length < 2 || !dataRef.current) { setResults([]); return }
    const q = query.toLowerCase().trim()
    const t = setTimeout(() => {
      const matches = dataRef.current.filter(r =>
        searchFields.some(f => r[f] && String(r[f]).toLowerCase().includes(q))
      ).slice(0, 20)
      setResults(matches)
    }, 250)
    return () => clearTimeout(t)
  }, [query, loaded])

  return (
    <div>
      <TopBar title={title} subtitle={subtitle} />
      <div style={{ padding: 24 }}>

        {statCards.length > 0 && (
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
            {statCards.map((c, i) => (
              <StatCard key={i} {...c} onClick={c.filter ? () => navigate(`/beneficiary?${new URLSearchParams(c.filter).toString()}`) : c.onClick} />
            ))}
          </div>
        )}

        {charts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: charts.length > 1 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 24 }}>
            {charts.map((chart, i) => (
              <ChartCard key={i} title={chart.title} style={chart.span2 ? { gridColumn: '1 / -1' } : undefined}>
                {chart.node}
              </ChartCard>
            ))}
          </div>
        )}

        <ChartCard title={`Search ${title}`}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={16} color="#9aa0a6" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={loaded ? searchPlaceholder : 'Loading…'}
              disabled={!loaded}
              style={{
                width: '100%', padding: '11px 36px 11px 38px',
                border: '1px solid ' + (query ? '#1a73e8' : '#e0e0e0'),
                borderRadius: 10, fontSize: 14, outline: 'none',
                background: loaded ? '#fff' : '#f8f9fa',
                boxSizing: 'border-box', color: '#202124',
              }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]) }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9aa0a6', display: 'flex' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: 12, color: '#5f6368', marginBottom: 6 }}>
                {results.length} result{results.length !== 1 ? 's' : ''} · Click column headers to sort
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                    {tableColumns.map(col => (
                      <th key={col.key} style={thStyle(col.key)} onClick={() => handleSort(col.key)}>
                        {col.label} <SortIcon col={col.key} />
                      </th>
                    ))}
                    <th style={{ padding: '9px 10px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((r, i) => (
                    <tr key={i}
                      onClick={() => setSelected(r)}
                      style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {tableColumns.map(col => (
                        <td key={col.key} style={{ padding: '9px 10px', color: '#5f6368', ...col.cellStyle }}>
                          {col.render ? col.render(r) : (r[col.key] || '—')}
                        </td>
                      ))}
                      <td style={{ padding: '9px 10px' }}><ChevronRight size={14} color="#9aa0a6" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {query.length >= 2 && loaded && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#9aa0a6', fontSize: 14 }}>No matching records found</div>
          )}
          {!query && loaded && (
            <div style={{ fontSize: 12, color: '#9aa0a6', textAlign: 'center', padding: '8px 0' }}>
              Type at least 2 characters to search
            </div>
          )}
        </ChartCard>

        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setSelected(null)}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 16, width: 560, maxHeight: '85vh',
              overflowY: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            }}>
              <div style={{ background: headerGradient, padding: '24px', color: '#fff', borderRadius: '16px 16px 0 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{selected.n || '—'}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                      {detailHeader ? detailHeader(selected) : ''}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={18} />
                  </button>
                </div>
                {detailBadges && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    {detailBadges(selected)}
                  </div>
                )}
              </div>

              <div style={{ padding: 24 }}>
                {detailSections(selected).map(({ label, color, rows }) => (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, borderBottom: `2px solid ${color}20`, paddingBottom: 6 }}>
                      {label}
                    </div>
                    {rows.map(([k, v]) => v && v !== '—' ? (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8f9fa' }}>
                        <span style={{ fontSize: 12, color: '#9aa0a6', minWidth: 140 }}>{k}</span>
                        <span style={{ fontSize: 13, color: '#202124', fontWeight: 500, textAlign: 'right', wordBreak: 'break-all' }}>{v}</span>
                      </div>
                    ) : null)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
