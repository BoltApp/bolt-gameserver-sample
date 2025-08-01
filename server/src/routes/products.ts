import { Router } from 'express'
import { db } from '../db'
import { Product } from '../types/shared'

const router = Router()

router.get('', (_, res) => {
  const products = db.getAllProducts()
    .map<Product>(({updatedAt, createdAt, ...product}) => ({
      ...product,
      savings: product.savings ?? undefined,
      popular: Boolean(product.popular),
    }))
  if (!products) {
    return res.status(404).json({ error: 'No products found' })
  }

  res.json(products)
})

export default router
