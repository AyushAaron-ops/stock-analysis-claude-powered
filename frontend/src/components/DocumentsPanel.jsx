import { useState, useRef } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { upload_document } from '../services/api'

const DOC_TYPES = [
  { value: 'annual_report',      label: 'Annual Report (10-K)' },
  { value: 'quarterly_report',   label: 'Quarterly Report (10-Q)' },
  { value: 'earnings_transcript',label: 'Earnings Transcript' },
  { value: 'industry_report',    label: 'Industry Report' },
  { value: 'research_memo',      label: 'Research Memo' },
  { value: 'other',              label: 'Other' },
]

const DOC_TYPE_BADGE_CLASS = {
  annual_report:       'badge-gold',
  quarterly_report:    'badge-green',
  earnings_transcript: 'badge-neutral',
  industry_report:     'badge-neutral',
  research_memo:       'badge-neutral',
  other:               'badge-neutral',
}

export function DocumentsPanel({ project_id, documents, on_uploaded, toast }) {
  const [selected_file, set_selected_file] = useState(null)
  const [doc_type, set_doc_type] = useState('other')
  const [uploading, set_uploading] = useState(false)
  const input_ref = useRef()

  const handle_file_change = (e) => {
    const f = e.target.files[0]
    if (f) set_selected_file(f)
  }

  const handle_upload = async () => {
    if (!selected_file) return
    set_uploading(true)
    try {
      const doc = await upload_document(project_id, selected_file, doc_type)
      on_uploaded(doc)
      toast.success(`Uploaded: ${doc.file_name}`)
      set_selected_file(null)
      if (input_ref.current) input_ref.current.value = ''
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Upload failed')
    } finally {
      set_uploading(false)
    }
  }

  return (
    <div>
      {/* Upload form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-mute)', marginBottom: 14 }}>
          Upload Document
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <label className="form-label">File (PDF, TXT, MD)</label>
            <input
              ref={input_ref}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handle_file_change}
              style={{ display: 'none' }}
              id="file-input"
            />
            <div
              style={{
                border: '1px dashed var(--border)',
                borderRadius: 'var(--radius)',
                padding: '10px 14px',
                cursor: 'pointer',
                background: 'var(--paper)',
                fontSize: '0.85rem',
                color: selected_file ? 'var(--ink)' : 'var(--ink-mute)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => input_ref.current.click()}
            >
              <Upload size={14} style={{ opacity: 0.5 }} />
              {selected_file ? selected_file.name : 'Click to select file…'}
              {selected_file && (
                <X
                  size={13}
                  style={{ marginLeft: 'auto', opacity: 0.5, cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); set_selected_file(null); input_ref.current.value = '' }}
                />
              )}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Document Type</label>
            <select className="form-select" value={doc_type} onChange={(e) => set_doc_type(e.target.value)}>
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-gold"
            onClick={handle_upload}
            disabled={!selected_file || uploading}
            style={{ marginBottom: 1 }}
          >
            {uploading ? <><span className="spinner" style={{ width: 13, height: 13, borderTopColor: '#fff' }} /> Uploading…</> : <><Upload size={13} /> Upload</>}
          </button>
        </div>
      </div>

      {/* Document list */}
      {documents.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 20px' }}>
          <div className="empty-icon" style={{ fontSize: '1.8rem' }}>📄</div>
          <h3 style={{ fontSize: '0.95rem' }}>No documents yet</h3>
          <p>Upload annual reports, transcripts, and filings to power your analysis</p>
        </div>
      ) : (
        <div className="doc-list">
          {documents.map((doc) => (
            <div key={doc.document_id} className="doc-item">
              <FileText size={14} style={{ color: 'var(--ink-mute)', flexShrink: 0 }} />
              <span className="doc-name">{doc.file_name}</span>
              <span className={`badge ${DOC_TYPE_BADGE_CLASS[doc.doc_type] || 'badge-neutral'}`}>
                {doc.doc_type.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {new Date(doc.uploaded_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
