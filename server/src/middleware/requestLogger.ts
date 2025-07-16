import type { Request, Response, NextFunction } from 'express'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const fullUrl = req.originalUrl
  
  // Capture request payload (for POST, PUT, PATCH requests)
  const payload = ['POST', 'PUT', 'PATCH'].includes(method) ? req.body : null
  
  // Log the request information
  console.log(`[${timestamp}] ${method} ${fullUrl}`)
  
  if (payload) {
    console.log(`[${timestamp}] Request payload:`, JSON.stringify(payload, null, 2))
  }
  
  // Log query parameters if they exist
  if (Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query parameters:`, req.query)
  }
  
  // Log headers (excluding sensitive ones)
  // const sanitizedHeaders = { ...req.headers }
  // delete sanitizedHeaders.authorization
  // delete sanitizedHeaders.cookie
  
  // console.log(`[${timestamp}] Headers:`, sanitizedHeaders)
  
  next()
}
