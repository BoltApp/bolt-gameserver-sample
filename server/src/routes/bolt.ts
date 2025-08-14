import { Router } from 'express'
import { boltApi } from '../bolt'
import type { ApiResponse, GetPaymentLinkResponse } from '../types/shared'
import type { BoltTransactionWebhook } from '../bolt/types/transaction-webhook'
import { db } from '../db'
import { verifySignature } from '../bolt/middleware'
import { env } from '../config'
import { CreatePaymentLinkRequest } from '../bolt/types'
import { authenticateToken } from '../middleware/auth'
import { TransactionService } from '../services/transactions'

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
        await TransactionService.processWebhook(input)
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

  const paymentLinkRequest: CreatePaymentLinkRequest = {
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

router.get('/verify', authenticateToken, async (req, res) => {
  const paymentLinkId = req.query.payment_link_id as string;
  console.log('Validating payment link:', paymentLinkId);
  
  try {
      const transactionResponse = await boltApi.gaming.getPaymentLinkResponse(paymentLinkId)
      const transaction = db.getTransactionByPaymentLinkId(paymentLinkId)
        ?? await TransactionService.processPaymentLinkRequest(transactionResponse)
      if (!transaction) {
        return res.status(404).json({ success: false, error: 'Transaction not found' })
      }
      if (transaction.status !== 'authorized') {
        return res.status(400).json({ success: false, error: 'Payment link not valid' })
      }
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ success: false, error: 'Payment link does not belong to user' })
      }
      
      const response: ApiResponse<GetPaymentLinkResponse> = {
        success: true,
        data: transactionResponse,
      }
      res.json(response)
    } catch (error) {
      console.error('Error validating transaction:', error)
      const response: ApiResponse<null> = { success: false, error: 'Transaction validation failed' }
      res.status(500).json(response)
    }
})

export default router
