import path from 'path'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
})

const Project = mongoose.model('Project', projectSchema)

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ startDate: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(400).json({ message: 'Invalid project ID' })
  }
})

app.post('/api/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body)
    res.status(201).json(project)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Invalid project ID' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ message: 'Project Management API is running' })
})

app.use(express.static(path.resolve('dist')))

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next()
  }

  res.sendFile(path.resolve('dist/index.html'), error => {
    if (error) next(error)
  })
})

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from the root .env file')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully')

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
  }
}

startServer()
