import { Router } from 'express'
import type { UserProfile } from '../types/shared'
import { db } from '../db'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  console.log('Fetching user profile for:', req.user)
  const userProfile = db.getUserProfileByUserId(req.user!.id)
  if (!userProfile) {
    return res.status(404).json({ error: 'User profile not found' })
  }
  
  const response: UserProfile = {
    id: userProfile.id,
    userId: userProfile.userId,
    username: req.user!.username,
    gems: userProfile.gems
  }
  
  res.json(response)
})

export default router
