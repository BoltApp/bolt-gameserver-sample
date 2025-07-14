import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { db } from '../db'
import { env } from '../config'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        username: string
      }
    }
  }
}

const JWT_SECRET = env.jwtSecret

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, username: string }
    
    // Verify user still exists in database
    const user = db.getUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'Invalid token: user not found' })
    }

    req.user = {
      id: decoded.userId,
      username: decoded.username
    }
    
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}
