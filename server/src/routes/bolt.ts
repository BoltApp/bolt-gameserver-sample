import { Router } from 'express'
import { boltApi } from '../bolt'
import type { ApiResponse } from '../types/shared'
import type { BoltTransactionWebhook } from '../bolt/types/transaction-webhook'
import { db } from '../db'
import { verifySignature } from '../bolt/middleware'
import { env } from '../config'

const router = Router()

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

/*
 * Handle Bolt transaction webhooks
 * https://help.bolt.com/developers/webhooks/transaction-webhooks/
 *
 * Always return 200 OK. Handle all issues with a dead letter queue or similar.
 */
router.post('/webhook', verifySignature, async (req, res) => {
  const input: BoltTransactionWebhook = req.body

  try {
    switch (input.object) {
      case 'transaction':
        await handleTransaction(input)
        break
      default:
        console.warn(`Unhandled Bolt webhook object: ${input.object}`)
    }

    const response: ApiResponse<null> = { success: true }
    res.json(response)
  } catch (error) {
    console.error(`Error handling Bolt webhook on object %o: %s`, input.object, error)
    const response: ApiResponse<null> = { success: false, error: `Webhook failed` }
    res.status(500).json(response)
  }
})

async function handleTransaction(input: BoltTransactionWebhook) {
  const userEmail = getPrimaryEmail(input.data.from_user)
  if (!userEmail) {
    // There might be an issue with your deserialization if you get here
    return
  }

  const user = db.getUserByEmail(userEmail)
  if (!user) {
    return
  }

  // See events: https://help.bolt.com/developers/webhooks/webhooks/#authorization-events
  if (input.type === 'auth' || input.type === 'payment') {
    const boltTransaction = await boltApi.transactions.get(input.data.reference)
    const sku = boltTransaction.order.cart.items[0].merchant_variant_id
    const product = await db.getProductBySku(sku)

    const gems = product?.gemAmount ?? 0
    if (gems > 0) {
      console.log(`Adding ${gems} gems for user ${user.username}`)
      db.addGemsToUser(user.id, gems)
    }
  } else if (input.type === 'failed_payments') {
    // Handle failed payments
  } else if (input.type === 'credit') {
    // Handle refunds
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
}

router.get('/products/:sku/checkout-link', async (req, res) => {
  const { sku } = req.params;

  res.json({
    success: true,
    data: {
      link: env.bolt.links[sku],
    },
  })
})

export default router
