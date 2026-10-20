
import { useState, useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
} from 'react-router-dom'
import './App.css'

function ProjectList() {
  const [projects, setProjects] = useState([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Web Development',
    status: 'Pending'
  })

  async function fetchProjects() {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')

      if (!response.ok) {
        throw new Error('Unable to load projects')
      }

      const data = await response.json()
      setProjects(data)
      setError('')
    } catch (err) {
      setError('Cannot connect to the backend. Please check the server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  async function addProject(event) {
    event.preventDefault()

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add project')
      }

      setForm({
        name: '',
        description: '',
        category: 'Web Development',
        status: 'Pending'
      })

      await fetchProjects()
    } catch (err) {
      setError(err.message)
    }
  }

  async function deleteProject(id) {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete project')
      }

      await fetchProjects()
    } catch (err) {
      setError(err.message)
    }
  }

  const categories = [
    'All',
    ...new Set(projects.map(project => project.category))
  ]

  const filteredProjects = category === 'All'
    ? projects
    : projects.filter(project => project.category === category)

  return (
    <main className="container">
      <header className="header">
        <div>
          <p className="eyebrow">PLAN · ORGANIZE · COMPLETE</p>
          <h1>Project Management</h1>
          <p className="subtitle">
            Organize your projects and track their progress.
          </p>
        </div>
        <div className="project-count">
          <span>{projects.length}</span>
          <small>Total Projects</small>
        </div>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Create a Project</h2>

        <form className="project-form" onSubmit={addProject}>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={event =>
              setForm({ ...form, name: event.target.value })
            }
            required
          />

          <input
            placeholder="Project description"
            value={form.description}
            onChange={event =>
              setForm({ ...form, description: event.target.value })
            }
            required
          />

          <select
            value={form.category}
            onChange={event =>
              setForm({ ...form, category: event.target.value })
            }
          >
            <option>Web Development</option>
            <option>Mobile App</option>
            <option>Data Science</option>
            <option>AI and Machine Learning</option>
            <option>Other</option>
          </select>

          <select
            value={form.status}
            onChange={event =>
              setForm({ ...form, status: event.target.value })
            }
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <button type="submit">+ Add Project</button>
        </form>
      </section>

      <section className="project-section">
        <div className="section-heading">
          <div>
            <h2>Your Projects</h2>
            <p>View and manage your saved projects.</p>
          </div>

          <select
            className="filter"
            value={category}
            onChange={event => setCategory(event.target.value)}
          >
            {categories.map(item => (
              <option key={item} value={item}>
                {item === 'All' ? 'All Categories' : item}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="message">Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects found</h3>
            <p>Add a project above to get started.</p>
          </div>
        ) : (
          <div className="project-grid">
            {filteredProjects.map(project => (
              <article className="project-card" key={project._id}>
                <div className="card-top">
                  <span className="category-tag">{project.category}</span>
                  <span className={`status ${project.status.toLowerCase().replaceAll(' ', '-')}`}>
                    {project.status}
                  </span>
                </div>

                <h3>{project.name}</h3>
                <p className="description">{project.description}</p>

                <div className="card-actions">
                  <Link to={`/projects/${project._id}`}>
                    View Details →
                  </Link>
                  <button
                    className="delete-button"
                    onClick={() => deleteProject(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function ProjectDetails() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${id}`)

        if (!response.ok) {
          throw new Error('Project not found')
        }

        setProject(await response.json())
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return <main className="container"><p>Loading project...</p></main>
  }

  if (error) {
    return (
      <main className="container">
        <p className="error">{error}</p>
        <Link to="/">← Back to Projects</Link>
      </main>
    )
  }

  return (
    <main className="container">
      <Link className="back-link" to="/">← Back to Projects</Link>

      <section className="details-card">
        <span className="category-tag">{project.category}</span>
        <h1>{project.name}</h1>
        <p>{project.description}</p>

        <div className="detail-row">
          <strong>Status</strong>
          <span>{project.status}</span>
        </div>

        <div className="detail-row">
          <strong>Created</strong>
          <span>
            {new Date(project.startDate).toLocaleDateString()}
          </span>
        </div>

        <div className="detail-row">
          <strong>Project ID</strong>
          <span>{project._id}</span>
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
