import { createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";

const signingSecret = process.env.BOLT_SIGNING_SECRET;

// https://help.bolt.com/developers/webhooks/hook-verification/
export function verifySignature(req: Request, res: Response, next: NextFunction) {
  const hmac_header = req.headers['x-bolt-hmac-sha256'];
  
  if (!hmac_header || !signingSecret) return false;

  const computedHmac = createHmac('sha256', signingSecret)
    .update(JSON.stringify(req.body))
    .digest('base64');

  const isValid = hmac_header === computedHmac;
  if (!isValid) {
    console.log('Invalid signature for Bolt webhook');
    res.status(403).json({ error: 'Invalid signature' });
    return;
  }

  next();
}
