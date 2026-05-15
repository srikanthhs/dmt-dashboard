import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Activity, Briefcase,
  GraduationCap, Home, FileText, Map, ChevronLeft, ChevronRight, UserSearch, Bike
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/disability', icon: Activity, label: 'Disability' },
  { to: '/demographics', icon: Users, label: 'Demographics' },
  { to: '/benefits', icon: FileText, label: 'Benefits & Docs' },
  { to: '/livelihood', icon: Briefcase, label: 'Livelihood' },
  { to: '/education', icon: GraduationCap, label: 'Education' },
  { to: '/infrastructure', icon: Home, label: 'Infrastructure' },
  { to: '/blocks', icon: Map, label: 'Block-wise' },
  { to: '/scooty', icon: Bike, label: 'Scooty Scheme' },
  { to: '/beneficiary', icon: UserSearch, label: 'Individual Search' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        minHeight: '100vh',
        background: '#fff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Google Sans',sans-serif", fontWeight: 700, fontSize: 15, color: '#1a73e8' }}>
              DMT Dashboard
            </div>
            <div style={{ fontSize: 11, color: '#5f6368', marginTop: 2 }}>Mayiladuthurai</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#5f6368', padding: 4, borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: collapsed ? '10px 0' : '10px 16px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              textDecoration: 'none',
              borderRadius: collapsed ? 0 : '0 24px 24px 0',
              margin: collapsed ? 0 : '2px 8px 2px 0',
              background: isActive ? '#e8f0fe' : 'transparent',
              color: isActive ? '#1a73e8' : '#3c4043',
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              transition: 'background 0.15s',
            })}
          >
            <Icon size={20} strokeWidth={1.8} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: collapsed ? '12px 0' : '12px 16px',
        borderTop: '1px solid #f0f0f0',
        fontSize: 11,
        color: '#9aa0a6',
        textAlign: collapsed ? 'center' : 'left',
      }}>
        {!collapsed ? 'Survey Data · Jan 2026' : '2026'}
      </div>
    </aside>
  )
}
