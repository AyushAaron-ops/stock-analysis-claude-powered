import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart2, Plus, Home, Trash2 } from 'lucide-react'

export function Sidebar({ projects, on_delete_project }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">AI × Finance</div>
        <h1>Stock Analyst</h1>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <Home size={15} />
          Dashboard
        </div>

        <div className="sidebar-section-label">Your Coverage</div>

        {projects.length === 0 && (
          <div style={{ padding: '10px 20px', fontSize: '0.78rem', color: 'rgba(240,235,224,0.35)' }}>
            No projects yet
          </div>
        )}

        {projects.map((p) => {
          const base = `/project/${p.project_id}`
          const is_active = location.pathname.startsWith(base)
          return (
            <div
              key={p.project_id}
              className={`nav-item ${is_active ? 'active' : ''}`}
              onClick={() => navigate(`/project/${p.project_id}`)}
            >
              <BarChart2 size={14} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.company_name}
              </span>
              <span className="ticker-badge">{p.ticker}</span>
            </div>
          )
        })}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Actions</div>
        <div className="nav-item" onClick={() => navigate('/new')}>
          <Plus size={14} />
          New Project
        </div>
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: 'rgba(240,235,224,0.25)', fontFamily: 'var(--font-mono)' }}>
        v1.0.0
      </div>
    </aside>
  )
}
