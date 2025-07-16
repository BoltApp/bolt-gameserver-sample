import { Router } from 'express'
import boltRoutes from './bolt'
import userRoutes from './user'
import authRoutes from './auth'
import productRoutes from './products'

const router = Router()

router.use('/auth', authRoutes)
router.use('/bolt', boltRoutes)
router.use('/user', userRoutes)
router.use('/products', productRoutes)

router.get('/health', (_, res) => {
  res.status(200).json({ status: 'OK' })
})

export default router
