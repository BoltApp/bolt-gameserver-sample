import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { generateToken } from '../middleware/auth'
import { db } from '../db'
import { v4 as uuidv4 } from 'uuid'
import type { ApiResponse, LoginResponse, UserProfile } from '../types/shared'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' })
    }

    const existingUsername = db.getUserByUsername(username)
    const existingEmail = db.getUserByEmail(email)
    if (existingEmail || existingUsername) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const userId = uuidv4()
    const user = {
      id: userId,
      username,
      passwordHash: hashedPassword,
      email,
    }

    db.createUser(user)

    const userProfile = {
      userId,
      name: username,
      displayName: username,
      gems: 0
    }
    db.createUserProfile(userProfile)

    const token = generateToken(userId, username)
    res.setHeader('Authorization', `${token}`)
    
    const response: ApiResponse<UserProfile> = {
      success: true,
      data: {
        userId,
        username,
        email,
        gems: userProfile.gems
      }
    }

    res.status(201).json(response)
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = db.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const userProfile = db.getUserProfileByUserId(user.id)

    const token = generateToken(user.id, user.username)

    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        token,
        user: {
          userId: user.id,
          username: user.username,
          email: user.email,
          gems: userProfile?.gems || 0
        }
      }
    }

    res.json(response)
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
