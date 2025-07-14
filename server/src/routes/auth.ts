import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { generateToken } from '../middleware/auth'
import { db } from '../db'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Username, password, and email are required' })
    }

    // Check if user already exists
    const existingUser = db.getUserByUsername(username)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const userId = uuidv4()
    const user = {
      id: userId,
      username,
      passwordHash: hashedPassword,
      email,
    }

    // Add user to database
    db.createUser(user)

    // Create user profile
    const userProfile = {
      userId,
      name: username,
      displayName: username,
      gems: 0
    }
    db.createUserProfile(userProfile)

    // Generate token
    const token = generateToken(userId, username)

    // Set JWT token in Authorization header
    res.setHeader('Authorization', `${token}`)
    
    res.status(201).json({
      success: true,
      user: {
        id: userId,
        username,
        gems: userProfile.gems
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    // Find user
    const user = db.getUserByUsername(username)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Get user profile for gems
    const userProfile = db.getUserProfileByUserId(user.id)

    // Generate token
    const token = generateToken(user.id, user.username)

    // Set JWT token in Authorization header
    res.setHeader('Authorization', `${token}`)
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        gems: userProfile?.gems || 0
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
