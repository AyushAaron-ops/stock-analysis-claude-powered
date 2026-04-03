import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get_project, list_documents } from '../services/api'
import { DocumentsPanel } from '../components/DocumentsPanel'
import { AnalysisPanel } from '../components/AnalysisPanel'
import { ChatPanel } from '../components/ChatPanel'
import { FileText, BarChart2, MessageSquare, Trash2 } from 'lucide-react'

const TABS = [
  { id: 'documents', label: 'Documents',  icon: <FileText size={14} /> },
  { id: 'analysis',  label: 'Analysis',   icon: <BarChart2 size={14} /> },
  { id: 'chat',      label: 'Chat',       icon: <MessageSquare size={14} /> },
]

export function ProjectPage({ projects, on_delete_project, toast }) {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [project, set_project] = useState(null)
  const [documents, set_documents] = useState([])
  const [tab, set_tab] = useState('documents')
  const [loading, set_loading] = useState(true)
  const [confirm_delete, set_confirm_delete] = useState(false)

  useEffect(() => {
    const local = projects.find((p) => p.project_id === project_id)
    if (local) set_project(local)
    load_data()
  }, [project_id])

  const load_data = async () => {
    set_loading(true)
    try {
      const [proj, docs] = await Promise.all([
        get_project(project_id),
        list_documents(project_id),
      ])
      set_project(proj)
      set_documents(docs)
    } catch {
      toast.error('Failed to load project')
      navigate('/')
    } finally {
      set_loading(false)
    }
  }

  const handle_document_uploaded = (doc) => {
    set_documents((prev) => [...prev, doc])
    set_project((p) => p ? { ...p, document_count: (p.document_count || 0) + 1 } : p)
  }

  const handle_delete = async () => {
    await on_delete_project(project_id)
    navigate('/')
  }

  if (loading || !project) {
    return (
      <div className="loading-overlay" style={{ marginTop: 80 }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
        <div>Loading project…</div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-gold">{project.ticker}</span>
            <span style={{ color: 'var(--ink-mute)', fontSize: '0.65rem' }}>{project.industry}</span>
          </div>
          <h2 style={{ marginTop: 6 }}>{project.company_name}</h2>
          <p style={{ marginTop: 4 }}>
            {documents.length} document{documents.length !== 1 ? 's' : ''} · Created {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="btn btn-danger" onClick={() => set_confirm_delete(true)}>
          <Trash2 size={13} /> Delete
        </button>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {TABS.map((t) => (
          <div
            key={t.id}
            className={`tab-item ${tab === t.id ? 'active' : ''}`}
            onClick={() => set_tab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {t.icon} {t.label}
            {t.id === 'documents' && documents.length > 0 && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', background: 'var(--paper-dark)', borderRadius: 10, padding: '1px 6px', color: 'var(--ink-mute)' }}>
                {documents.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'documents' && (
        <DocumentsPanel
          project_id={project_id}
          documents={documents}
          on_uploaded={handle_document_uploaded}
          toast={toast}
        />
      )}
      {tab === 'analysis' && (
        <AnalysisPanel
          project_id={project_id}
          doc_count={documents.length}
          toast={toast}
        />
      )}
      {tab === 'chat' && (
        <ChatPanel
          project_id={project_id}
          project={project}
          toast={toast}
        />
      )}

      {/* Delete confirm modal */}
      {confirm_delete && (
        <div className="modal-overlay" onClick={() => set_confirm_delete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete {project.ticker} Project?</h3>
            <p style={{ margin: '12px 0 24px', fontSize: '0.9rem' }}>
              This will permanently remove the project and all associated data. Uploaded files will also be deleted.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" onClick={handle_delete}>Yes, Delete</button>
              <button className="btn btn-ghost" onClick={() => set_confirm_delete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
