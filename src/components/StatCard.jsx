import { useState } from 'react'

export default function StatCard({ label, value, sub, icon: Icon, color = '#1a73e8', trend, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        boxShadow: hovered && onClick ? '0 4px 16px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.08)',
        border: hovered && onClick ? `1px solid ${color}80` : '1px solid #f0f0f0',
        flex: 1,
        minWidth: 160,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        transform: hovered && onClick ? 'translateY(-1px)' : 'none',
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon && <Icon size={22} color={color} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#5f6368', fontWeight: 500, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'Google Sans',sans-serif",
          fontSize: 28, fontWeight: 700, color: '#202124', lineHeight: 1,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && (
          <div style={{ fontSize: 12, color: '#80868b', marginTop: 4 }}>{sub}</div>
        )}
        {trend !== undefined && (
          <div style={{
            fontSize: 12, marginTop: 6,
            color: trend >= 0 ? '#0f9d58' : '#ea4335',
            fontWeight: 500,
          }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        )}
        {onClick && (
          <div style={{ fontSize: 11, color: color, marginTop: 6, fontWeight: 500, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s' }}>
            Click to explore →
          </div>
        )}
      </div>
    </div>
  )
}
