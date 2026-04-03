import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { run_analysis } from '../services/api'
import { Zap, TrendingUp, TrendingDown, Globe, BarChart2 } from 'lucide-react'

const ANALYSIS_TYPES = [
  {
    id: 'industry_overview',
    title: 'Industry Overview',
    icon: <Globe size={20} />,
    desc: 'How the industry works, growth drivers, structural constraints',
    label: 'Generate Overview',
    badge_class: 'badge-neutral',
  },
  {
    id: 'bull_case',
    title: 'The Lynch Pitch',
    icon: <TrendingUp size={20} />,
    desc: "Why you'd own this stock \u2014 simple, sourced reasoning",
    label: 'Build Bull Case',
    badge_class: 'badge-green',
  },
  {
    id: 'bear_case',
    title: 'The Munger Invert',
    icon: <TrendingDown size={20} />,
    desc: 'How you could lose money — invalidate the bull case',
    label: 'Build Bear Case',
    badge_class: 'badge-red',
  },
  {
    id: 'quarterly_update',
    title: 'Quarterly Update',
    icon: <BarChart2 size={20} />,
    desc: 'Guidance vs reality, KPI trends, what actually changed',
    label: 'Run Q Update',
    badge_class: 'badge-gold',
    needs_quarter: true,
  },
]

export function AnalysisPanel({ project_id, doc_count, toast }) {
  const [active_type, set_active_type] = useState(null)
  const [loading, set_loading] = useState(false)
  const [result, set_result] = useState(null)
  const [quarter, set_quarter] = useState('')

  const run = async (type_id) => {
    if (doc_count === 0) {
      toast.error('Upload at least one document before running analysis')
      return
    }
    const type_def = ANALYSIS_TYPES.find((t) => t.id === type_id)
    if (type_def?.needs_quarter && !quarter.trim()) {
      toast.error('Enter a quarter (e.g. Q1 2025) before running')
      return
    }
    set_active_type(type_id)
    set_loading(true)
    set_result(null)
    try {
      const data = await run_analysis(
        project_id,
        type_id,
        type_def?.needs_quarter ? quarter.trim() : null
      )
      set_result(data)
      toast.success('Analysis complete')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Analysis failed')
      set_active_type(null)
    } finally {
      set_loading(false)
    }
  }

  return (
    <div>
      <div className="analysis-card-grid">
        {ANALYSIS_TYPES.map((t) => (
          <div
            key={t.id}
            className={`analysis-card ${active_type === t.id && result ? 'active' : ''}`}
          >
            <div style={{ color: 'var(--gold)', opacity: 0.8 }}>{t.icon}</div>
            <div className="card-title">{t.title}</div>
            <div className="card-desc">{t.desc}</div>
            {t.needs_quarter && (
              <input
                className="form-input"
                placeholder="e.g. Q1 2025"
                value={quarter}
                onChange={(e) => set_quarter(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px', marginTop: 4 }}
              />
            )}
            <button
              className="btn btn-primary"
              style={{ marginTop: 4, fontSize: '0.8rem', padding: '7px 12px' }}
              onClick={() => run(t.id)}
              disabled={loading}
            >
              {loading && active_type === t.id ? (
                <><span className="spinner" style={{ width: 12, height: 12, borderTopColor: '#f0ebe0' }} /> Running…</>
              ) : (
                <><Zap size={12} /> {t.label}</>
              )}
            </button>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" style={{ width: 28, height: 28 }} />
          <div>Running deep analysis with extended thinking…</div>
          <div style={{ opacity: 0.5 }}>This may take 1–3 minutes</div>
        </div>
      )}

      {result && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-mute)' }}>
              {ANALYSIS_TYPES.find((t) => t.id === result.analysis_type)?.title} — Output
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '5px 12px' }} onClick={() => { set_result(null); set_active_type(null) }}>
              Clear
            </button>
          </div>
          <div className="analysis-output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
