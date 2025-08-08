import { Router } from 'express'
import { boltApi } from '../bolt'
import type { ApiResponse } from '../types/shared'
import type { BoltTransactionWebhook } from '../bolt/types/transaction-webhook'
import { db } from '../db'
import { verifySignature } from '../bolt/middleware'
import { env } from '../config'
import { PaymentLinkRequest } from '../bolt/types'
import { authenticateToken } from '../middleware/auth'

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
        console.log(`Received transaction webhook for ${input.type}:`, input)
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
  const paymentLink = input.data.payment_link;

  const user = db.getUserById(paymentLink.user_id)
  if (!user) {
    return
  }

  // See events: https://help.bolt.com/developers/webhooks/webhooks/#authorization-events
  if (input.type === 'auth' || input.type === 'payment') {
    const metadata = JSON.parse(paymentLink.metadata || '{}')
    const product = await db.getProductBySku(metadata.sku)

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
    boltPaymentLinkId: input.data.payment_link.id,
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

router.post('/products/:sku/payment-link', authenticateToken, (req, res) => {
  const { sku } = req.params;

  const product = db.getProductBySku(sku);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const paymentLinkRequest: PaymentLinkRequest = {
    item: {
      price: Math.floor(product.price * 100),
      name: product.name,
      currency: 'USD',
    },
    redirect_url: "https://example.com/checkout/success",
    user_id: req.user!.id,
    game_id: env.bolt.gameId,
    metadata: {
      sku: product.sku,
    },
  };

  boltApi.gaming.createPaymentLink(paymentLinkRequest)
    .then((response) => {
      res.json({ success: true, data: response });
    })
    .catch((error) => {
      // const {} = error
      console.error('Error creating payment link:', error.request, error.response);
      res.status(500).json({ success: false, error: 'Failed to create payment link' });
    });
})

export default router
