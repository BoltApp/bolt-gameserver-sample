import { Router } from 'express'
import { boltApi } from '../bolt'
import type { 
  ApiResponse 
} from '../types/shared'
import type { BoltTransactionWebhook } from '../bolt/types/transaction-webhook'
import { db } from '../db'
import { verifySignature } from '../bolt/middleware'

const router = Router()

function getPrimaryEmail(user: BoltTransactionWebhook['data']['from_user']): string {
  return user?.emails[0]?.address!
}

/*
 * Handle Bolt transaction webhooks
 * https://help.bolt.com/developers/webhooks/transaction-webhooks/
 *
 * Always return 200 OK. Handle all issues with a dead letter queue or similar.
 */
router.post('/webhook', verifySignature, async (req, res) => {
  try {
    const input: BoltTransactionWebhook = req.body
    if (input.object === 'transaction') {
      const userEmail = getPrimaryEmail(input.data.from_user)
      if (!userEmail) {
        // There might be an issue with your deserialization if you get here
        return res.status(200)
      }

      const user = db.getUserByEmail(userEmail)
      if (!user) {
        return res.status(200)
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
      } else if (input.type === 'failed_payments') {
        // Handle failed payments if necessary
      }

      db.upsertTransaction({
        userId: user.id,
        boltReference: input.data.reference,
        status: input.type,
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

export default router
