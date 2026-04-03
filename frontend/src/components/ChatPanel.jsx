import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { send_chat } from '../services/api'
import { Send } from 'lucide-react'

export function ChatPanel({ project_id, project, toast }) {
  const [messages, set_messages] = useState([])
  const [input, set_input] = useState('')
  const [loading, set_loading] = useState(false)
  const bottom_ref = useRef(null)

  useEffect(() => {
    bottom_ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const build_history = () =>
    messages.map((m) => ({ role: m.role, content: m.content }))

  const handle_send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const user_msg = { role: 'user', content: text }
    set_messages((prev) => [...prev, user_msg])
    set_input('')
    set_loading(true)
    try {
      const history = build_history()
      const data = await send_chat(project_id, text, history)
      set_messages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Chat request failed')
      set_messages((prev) => prev.slice(0, -1))
      set_input(text)
    } finally {
      set_loading(false)
    }
  }

  const handle_key = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handle_send() }
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state" style={{ padding: '24px 0' }}>
            <div className="empty-icon" style={{ fontSize: '2rem' }}>💬</div>
            <h3 style={{ fontSize: '0.95rem' }}>Ask your analyst</h3>
            <p style={{ fontSize: '0.8rem' }}>
              Ask anything about {project.company_name}. Every answer is grounded in your uploaded documents.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {[
                'What are the key revenue drivers?',
                'How has gross margin trended?',
                'What did management say about capex?',
                'What is the biggest risk factor?',
              ].map((q) => (
                <button
                  key={q}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.75rem', padding: '5px 12px' }}
                  onClick={() => { set_input(q) }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role}`}>
            {m.role === 'user' ? (
              m.content
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spinner" style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-mute)' }}>Analyst is thinking…</span>
          </div>
        )}

        <div ref={bottom_ref} />
      </div>

      <div className="chat-input-row">
        <input
          className="form-input"
          placeholder={`Ask about ${project.ticker}…`}
          value={input}
          onChange={(e) => set_input(e.target.value)}
          onKeyDown={handle_key}
          disabled={loading}
        />
        <button className="btn btn-primary" onClick={handle_send} disabled={!input.trim() || loading}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
