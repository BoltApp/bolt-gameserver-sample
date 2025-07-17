import { Router } from 'express'
import type { ApiResponse, UserProfile } from '../types/shared'
import { db } from '../db'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/profile', authenticateToken, (req, res) => {
  const userProfile = db.getUserProfileByUserId(req.user!.id)
  if (!userProfile) {
    return res.status(404).json({ error: 'User profile not found' })
  }

  const response: UserProfile = {
    userId: userProfile.userId,
    username: req.user!.username,
    email: req.user!.email,
    gems: userProfile.gems
  }
  
  res.json(response)
})

// FE should poll every second
// TODO: Doc: if you support streaming, you should do something else
router.get('/validate', authenticateToken, (req, res) => {
  const transactionReference = req.query.transaction as string
  console.log('Validating transaction:', transactionReference)

  try {
    const transaction = db.getTransactionByBoltReference(transactionReference)
    console.log('Transaction found:', transaction)
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }
    if (transaction.status !== 'authorized') {
      return res.status(400).json({ success: false, error: 'Transaction not valid' })
    }
    if (transaction.userId !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Transaction does not belong to user' })
    }

    const userProfile = db.getUserProfileByUserId(req.user!.id)
    if (!userProfile) {
      return res.status(404).json({ success: false, error: 'User profile not found' })
    }
    const response: ApiResponse<UserProfile> = {
      success: true,
      data: {
        userId: userProfile.userId,
        username: req.user!.username,
        email: req.user!.email,
        gems: userProfile.gems
      }
    }
    res.json(response)
  } catch (error) {
    console.error('Error validating transaction:', error)
    const response: ApiResponse<null> = { success: false, error: 'Transaction validation failed' }
    res.status(500).json(response)
  }
})

export default router
