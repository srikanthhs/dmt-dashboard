export default function ChartCard({ title, children, style }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      border: '1px solid #f0f0f0',
      ...style,
    }}>
      <h3 style={{
        fontFamily: "'Google Sans',sans-serif",
        fontSize: 15, fontWeight: 500, color: '#202124',
        marginBottom: 16,
      }}>
        {title}
      </h3>
      {children}
    </div>
  )
}
