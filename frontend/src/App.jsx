import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar'
import { ToastContainer } from './components/ToastContainer'
import { DashboardPage } from './pages/DashboardPage'
import { NewProjectPage } from './pages/NewProjectPage'
import { ProjectPage } from './pages/ProjectPage'
import { use_toast } from './hooks/use_toast'
import { list_projects, delete_project } from './services/api'

export default function App() {
  const [projects, set_projects] = useState([])
  const { toasts, toast } = use_toast()

  useEffect(() => {
    load_projects()
  }, [])

  const load_projects = async () => {
    try {
      const data = await list_projects()
      set_projects(data)
    } catch {
      // backend might not be running yet
    }
  }

  const on_project_created = (project) => {
    set_projects((prev) => [...prev, project])
  }

  const on_delete_project = async (project_id) => {
    try {
      await delete_project(project_id)
      set_projects((prev) => prev.filter((p) => p.project_id !== project_id))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="app-shell">
      <Sidebar projects={projects} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage projects={projects} />} />
          <Route
            path="/new"
            element={<NewProjectPage on_project_created={on_project_created} toast={toast} />}
          />
          <Route
            path="/project/:project_id"
            element={
              <ProjectPage
                projects={projects}
                on_delete_project={on_delete_project}
                toast={toast}
              />
            }
          />
        </Routes>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  )
}
