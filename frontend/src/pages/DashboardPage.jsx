import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp, FileText, MessageSquare } from 'lucide-react'

export function DashboardPage({ projects }) {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="eyebrow">Overview</div>
        <h2>Your Coverage Universe</h2>
        <p>Manage your stock research projects powered by Claude</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Active Projects', value: projects.length, icon: <TrendingUp size={18} /> },
          { label: 'Total Documents', value: projects.reduce((s, p) => s + (p.document_count || 0), 0), icon: <FileText size={18} /> },
        ].map((s) => (
          <div key={s.label} className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: 'var(--gold)', opacity: 0.8 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Project grid */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No projects yet</h3>
          <p>Create your first stock research project to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/new')}>
            <Plus size={15} /> New Project
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--ink-mute)' }}>
              Active Coverage
            </h3>
            <button className="btn btn-primary" onClick={() => navigate('/new')}>
              <Plus size={14} /> Add Stock
            </button>
          </div>
          <div className="card-grid">
            {projects.map((p) => (
              <div
                key={p.project_id}
                className="card"
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                onClick={() => navigate(`/project/${p.project_id}`)}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span className="badge badge-gold">{p.ticker}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                    {p.document_count} doc{p.document_count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--ink)', marginBottom: 4 }}>{p.company_name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ink-mute)', marginBottom: 16 }}>{p.industry}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
                    Created {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Guide */}
      <div className="card" style={{ marginTop: 40, background: 'var(--paper-alt)', border: '1px solid var(--paper-dark)' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: 'var(--ink)' }}>
          The 5-Step Framework
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            ['01', 'Setup Project', 'Create a project per stock with custom analyst instructions'],
            ['02', 'Industry Context', 'Generate an industry overview to ground the analysis'],
            ['03', 'Upload History', 'Feed annual reports, transcripts, filings (5+ years)'],
            ['04', 'Bull & Bear Cases', 'Build conviction anchors you can re-read in 90 seconds'],
            ['05', 'Quarterly Updates', 'Evaluate every earnings release in historical context'],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ padding: '12px 0' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--gold)', marginBottom: 4 }}>STEP {num}</div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-mute)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
