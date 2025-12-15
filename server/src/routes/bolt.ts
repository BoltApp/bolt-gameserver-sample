import { Router } from "express";
import type {
  CreatePaymentLinkRequest,
  GetPaymentLinkResponse,
  BoltTransactionWebhook,
} from "@boltpay/bolt-js";

import type { ApiResponse } from "../types/shared";

import { boltApi } from "../bolt";
import { env } from "../config";
import { db } from "../db";
import { verifySignature } from "../bolt/middleware";
import { authenticateToken } from "../middleware/auth";
import { TransactionService } from "../services/transactions";
import { getAssetUrlForSku } from "../utils/assets";

const router = Router();

router.get("/products", async (_, res) => {
  try {
    const products = await boltApi.products.getAll();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/*
 * Handle Bolt transaction webhooks
 * https://help.bolt.com/developers/webhooks/transaction-webhooks/
 *
 * Always return 200 OK. Handle all issues with a dead letter queue or similar.
 */
router.post("/webhook", verifySignature, async (req, res) => {
  const input: BoltTransactionWebhook = req.body;

  try {
    switch (input.object) {
      case "transaction":
        console.log(`Received transaction webhook for ${input.type}:`, input);
        await TransactionService.processWebhook(input);
        break;
      default:
        console.warn(`Unhandled Bolt webhook object: ${input.object}`);
    }

    const response: ApiResponse<null> = { success: true };
    res.json(response);
  } catch (error) {
    console.error(
      `Error handling Bolt webhook on object %o: %s`,
      input.object,
      error
    );
    const response: ApiResponse<null> = {
      success: false,
      error: `Webhook failed`,
    };
    res.status(500).json(response);
  }
});

router.get("/products/:sku/checkout-link", async (req, res) => {
  const { sku } = req.params;

  res.json({
    success: true,
    data: {
      link: env.bolt.links[sku],
    },
  });
});

router.post("/products/:sku/payment-link", authenticateToken, (req, res) => {
  try {
    const { sku } = req.params;

    const product = db.getProductBySku(sku);
    if (!product) {
      return res.status(404).json({ error: "Product sku not found" });
    }

    const paymentLinkRequest: CreatePaymentLinkRequest = {
      item: {
        price: Math.floor(product.price * 100),
        name: product.name,
        currency: "USD",
        image_url: getAssetUrlForSku(sku),
      },
      redirect_url: "https://example.com/checkout/success",
      user_id: req.user!.id,
      game_id: env.bolt.gameId,
      metadata: {
        sku: product.sku,
      },
    };

    boltApi.gaming
      .createPaymentLink(paymentLinkRequest)
      .then((response) => {
        console.log("Created payment link:", response);
        res.json({ success: true, data: response });
      })
      .catch((error) => {
        const {} = error;
        console.error("Error creating payment link");
        console.error("Response headers:", error?.response?.headers);
        console.error("Response body:", error?.response?.data);
        res.status(500).json({
          success: false,
          error: "Failed to create payment link. " + (error as Error).message,
        });
      });
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error. " + (error as Error).message,
    });
  }
});

router.get("/verify", authenticateToken, async (req, res) => {
  const paymentLinkId = req.query.payment_link_id as string;
  console.log("Validating payment link:", paymentLinkId);

  try {
    const transactionResponse = await boltApi.gaming.getPaymentLinkResponse(
      paymentLinkId
    );
    const transaction =
      db.getTransactionByPaymentLinkId(paymentLinkId) ??
      (await TransactionService.processPaymentLinkRequest(transactionResponse));
    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, error: "Transaction not found" });
    }
    if (transaction.status !== "authorized") {
      return res
        .status(400)
        .json({ success: false, error: "Payment link not valid" });
    }
    if (transaction.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: "Payment link does not belong to user",
      });
    }

    const response: ApiResponse<GetPaymentLinkResponse> = {
      success: true,
      data: transactionResponse,
    };
    res.json(response);
  } catch (error) {
    console.error("Error validating transaction:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: "Transaction validation failed",
    };
    res.status(500).json(response);
  }
});

export default router;
