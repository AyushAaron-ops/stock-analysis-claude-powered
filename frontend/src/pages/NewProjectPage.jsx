import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { create_project } from '../services/api'

export function NewProjectPage({ on_project_created, toast }) {
  const navigate = useNavigate()
  const [form, set_form] = useState({ ticker: '', company_name: '', industry: '' })
  const [loading, set_loading] = useState(false)

  const handle_change = (e) => set_form((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handle_submit = async (e) => {
    e.preventDefault()
    if (!form.ticker || !form.company_name || !form.industry) {
      toast.error('All fields are required')
      return
    }
    set_loading(true)
    try {
      const project = await create_project(form)
      on_project_created(project)
      toast.success(`Project created for ${project.ticker}`)
      navigate(`/project/${project.project_id}`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create project')
    } finally {
      set_loading(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 560 }}>
      <div className="page-header">
        <div className="eyebrow">New Coverage</div>
        <h2>Create a Project</h2>
        <p>One project per stock. Claude will act as a dedicated analyst for that ticker.</p>
      </div>

      <div className="card">
        <form onSubmit={handle_submit}>
          <div className="form-group">
            <label className="form-label">Ticker Symbol</label>
            <input
              className="form-input"
              name="ticker"
              value={form.ticker}
              onChange={handle_change}
              placeholder="e.g. AAPL"
              style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              className="form-input"
              name="company_name"
              value={form.company_name}
              onChange={handle_change}
              placeholder="e.g. Apple Inc."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Industry</label>
            <input
              className="form-input"
              name="industry"
              value={form.industry}
              onChange={handle_change}
              placeholder="e.g. Consumer Electronics / Technology"
            />
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Creating…</> : 'Create Project'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--paper-alt)', borderRadius: 'var(--radius)', border: '1px solid var(--paper-dark)', fontSize: '0.8rem', color: 'var(--ink-mute)', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--ink)' }}>After creating:</strong> Upload annual reports, earnings transcripts, and industry reports. The more documents you add, the more grounded and accurate every analysis will be.
      </div>
    </div>
  )
}
