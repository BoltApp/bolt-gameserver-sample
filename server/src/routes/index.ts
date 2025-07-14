import { Router } from 'express'
import boltRoutes from './bolt'
import userRoutes from './user'
import authRoutes from './auth'

const router = Router()

// Mount routes
router.use('/auth', authRoutes)
router.use('/bolt', boltRoutes)
router.use('/user', userRoutes)

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' })
})

export default router
