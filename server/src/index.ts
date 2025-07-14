import express from 'express'
import cors from 'cors'
import routes from './routes'

const app = express()
const PORT = 3111

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
