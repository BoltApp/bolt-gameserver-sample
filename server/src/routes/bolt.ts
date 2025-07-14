import { Router } from 'express'
import { boltApi } from '../bolt'
import { authenticateToken } from '../middleware/auth'
import type { 
  BoltTransactionInput, 
  TransactionValidationInput, 
  RestorePurchasesInput,
  ApiResponse 
} from '../types/shared'

const router = Router()

// Get all products - requires authentication
router.get('/products', async (req, res) => {
  try {
    const products = await boltApi.products.getAll()
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Webhook endpoint for Bolt transactions
// transaction success.
// transaction refund
router.post('/webhook', async (req, res) => {
  try {
    const { userId, transactionId }: BoltTransactionInput = req.body

    // transactions success.
    // implement SSO for account creation

    // add gems to user
    // Handle the transaction logic here
    console.log(`User ${userId} purchased product ${transactionId}`)
    
    const response: ApiResponse<null> = { success: true }
    res.json(response)
  } catch (error) {
    console.error('Error handling transaction:', error)
    const response: ApiResponse<null> = { success: false, error: 'Transaction failed' }
    res.status(500).json(response)
  }
})

// we recommend checking against bolt transaction history to ensure integrity
// good idea to periodically check or trigger in case webhook fails (check your monitors)
router.post('/restore-purchases', authenticateToken, async (req, res) => {
  try {
    const input: RestorePurchasesInput = req.body
    
    // TODO: Implement restore purchases logic
    
    const response: ApiResponse<null> = { success: true }
    res.json(response)
  } catch (error) {
    console.error('Error restoring purchases:', error)
    const response: ApiResponse<null> = { success: false, error: 'Failed to restore purchases' }
    res.status(500).json(response)
  }
})

// param: reference
// returns user
// fail: { success: false } | { success: true, user }
// FE should poll every second
// Doc: if you support streaming, you should do something else
router.post('/validate-transaction', authenticateToken, async (req, res) => {
  try {
    const input: TransactionValidationInput = req.body
    
    // TODO: Implement transaction validation logic
    
    const response: ApiResponse<null> = { success: true }
    res.json(response)
  } catch (error) {
    console.error('Error validating transaction:', error)
    const response: ApiResponse<null> = { success: false, error: 'Transaction validation failed' }
    res.status(500).json(response)
  }
})

export default router
