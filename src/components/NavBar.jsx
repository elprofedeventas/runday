import { useNavigate, useLocation } from 'react-router-dom'

const ITEMS = [
  {
    path: '/',
    label: 'Hoy',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    path: '/historial',
    label: 'Historial',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    path: '/perfil',
    label: 'Perfil',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="nav-bar">
      {ITEMS.map(item => {
        const active = pathname === item.path
        return (
          <button
            key={item.path}
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon(active)}
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
