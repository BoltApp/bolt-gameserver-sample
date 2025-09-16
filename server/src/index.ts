import express from 'express'
import cors from 'cors'
import routes from './routes'
import { requestLogger } from './middleware/requestLogger'

const app = express()
const PORT = 3111

// Headers
app.disable('x-powered-by')

// Middleware
app.use(cors())
app.use(express.json())
app.use(requestLogger)

// API Routes
app.use('/api', routes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
