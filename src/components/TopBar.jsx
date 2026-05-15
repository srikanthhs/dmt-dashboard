import { Search, Bell } from 'lucide-react'

export default function TopBar({ title, subtitle }) {
  return (
    <header style={{
      height: 64,
      background: '#fff',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 5,
    }}>
      <div>
        <h1 style={{ fontFamily: "'Google Sans',sans-serif", fontSize: 20, fontWeight: 500, color: '#202124' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#5f6368', marginTop: 1 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f1f3f4', borderRadius: 24,
          padding: '8px 16px', width: 240,
        }}>
          <Search size={16} color="#5f6368" />
          <input
            placeholder="Search..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 14, color: '#3c4043', width: '100%',
            }}
          />
        </div>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 8, borderRadius: 20, display: 'flex', alignItems: 'center',
          color: '#5f6368',
        }}>
          <Bell size={20} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#1a73e8', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          DM
        </div>
      </div>
    </header>
  )
}
