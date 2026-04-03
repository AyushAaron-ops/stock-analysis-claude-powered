import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000, // 5 min for long analysis calls
})

// ── Projects ──────────────────────────────────────────────────────────────────

export const create_project = (data) =>
  api.post('/projects', data).then((r) => r.data)

export const list_projects = () =>
  api.get('/projects').then((r) => r.data)

export const get_project = (project_id) =>
  api.get(`/projects/${project_id}`).then((r) => r.data)

export const delete_project = (project_id) =>
  api.delete(`/projects/${project_id}`)

// ── Documents ─────────────────────────────────────────────────────────────────

export const upload_document = (project_id, file, doc_type) => {
  const form = new FormData()
  form.append('file', file)
  form.append('doc_type', doc_type)
  return api
    .post(`/projects/${project_id}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data)
}

export const list_documents = (project_id) =>
  api.get(`/projects/${project_id}/documents`).then((r) => r.data)

// ── Analysis ──────────────────────────────────────────────────────────────────

export const run_analysis = (project_id, analysis_type, extra_context = null) =>
  api
    .post(`/projects/${project_id}/analysis/${analysis_type}`, { extra_context })
    .then((r) => r.data)

export const send_chat = (project_id, message, conversation_history = []) =>
  api
    .post(`/projects/${project_id}/analysis/chat/message`, {
      project_id,
      message,
      conversation_history,
    })
    .then((r) => r.data)

export default api
