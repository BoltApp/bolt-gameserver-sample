import { Router } from 'express'
import { boltApi } from '../bolt'
import { authenticateToken } from '../middleware/auth'
import type { 
  ApiResponse 
} from '../types/shared'
import type { BoltTransactionWebhook } from '../bolt/types/transaction-webhook'
import { db } from '../db'

const router = Router()

// TODO: implement SSO for account creation `bolt/universal`

router.get('/products', async (_, res) => {
  try {
    const products = await boltApi.products.getAll()
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})


function getPrimaryEmail(user: BoltTransactionWebhook['data']['from_user']): string | undefined {
  return user?.emails[0]?.address
}

const webhookTypes = ['pending', 'auth', 'capture', 'credit'] as const
function isWebhookTypeOrGreater(type: BoltTransactionWebhook['type'], input: BoltTransactionWebhook): boolean {
  const compareIndex = webhookTypes.indexOf(type)
  const inputIndex = webhookTypes.indexOf(input.type)
  return inputIndex >= compareIndex
}

router.post('/webhook', async (req, res) => {
  try {

    const input: BoltTransactionWebhook = req.body
    // TODO: what is input.type vs input.data.status
    if (input.object === 'transaction') {
      const userEmail = getPrimaryEmail(input.data.from_user)
      if (!userEmail) {
        return res.status(400).json({ error: 'User email is required for transaction' })
      }
      const user = db.getUserByEmail(userEmail)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      if (input.type === 'auth') {
        const boltTransaction = await boltApi.transactions.get(input.data.reference)
        const sku = boltTransaction.order.cart.items[0].merchant_variant_id
        const product = await db.getProductBySku(sku)
  
        const gems = product?.gemAmount ?? 0
        if (gems > 0) {
          console.log(`Adding ${gems} gems for user ${user.username}`)
          db.addGemsToUser(user.id, gems)
        }
      }

      db.upsertTransaction({
        userId: user.id,
        boltReference: input.data.reference,
        acknowledged: isWebhookTypeOrGreater('auth', input),
        status: input.data.status,
        totalAmount: {
          value: input.data.amount.amount,
          currency: input.data.amount.currency
        }
      })
      console.log(`Transaction ${input.data.reference} processed for user ${user.username}. Status: ${input.data.status}`)
    } else if (input.object === 'transaction' && input.type === 'credit') {
      // Handle refund
    }

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
    // stub
    const subscriptions = await boltApi.subscriptions.getAllForUser(req.user!.email)
    const subscriptionOrders = await boltApi.subscriptions.getOrders(subscriptions.map(sub => sub.id))

    const response: ApiResponse<any> = { success: true, data: { subscriptions, subscriptionOrders } }
    res.json(response)
  } catch (error) {
    console.error('Error restoring purchases:', (error as Error).message)
    const response: ApiResponse<null> = { success: false, error: 'Failed to restore purchases' }
    res.status(500).json(response)
  }
})

export default router
