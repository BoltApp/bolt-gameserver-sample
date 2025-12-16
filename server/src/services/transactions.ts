import type {
  GetPaymentLinkRequest,
  GetPaymentLinkResponse,
  BoltTransactionWebhook,
} from "@boltpay/bolt-js";

import { DatabaseService, db } from "../db";
import type { User } from "../types/shared";

export const createTransactionService = (db: DatabaseService) => {
  // Helper function to validate user existence
  const validateUser = (userId: string) => {
    const user = db.getUserById(userId);
    if (!user) {
      console.warn(`User not found: ${userId}`);
    }
    return user;
  };

  // Helper function to process gems for successful transactions
  const processGemsForUser = async (user: User, metadata: any) => {
    const product = await db.getProductBySku(metadata.sku);
    const gems = product?.gemAmount ?? 0;

    if (gems > 0) {
      console.log(`Adding ${gems} gems for user ${user.username}`);
      db.addGemsToUser(user.id, gems);
    }

    return gems;
  };

  const handleSuccessfulTransaction = async (
    user: User,
    paymentLink: GetPaymentLinkRequest
  ) => {
    const metadata =
      typeof paymentLink.metadata === "string"
        ? JSON.parse(paymentLink.metadata || "{}")
        : paymentLink.metadata || {};

    return await processGemsForUser(user, metadata);
  };

  const logTransactionCompletion = (
    transaction: { reference: string; status: string },
    user: User
  ) => {
    console.log(
      `Transaction ${transaction.reference} processed for user ${user.username}. Status: ${transaction.status}`
    );
  };

  const shouldProcessGems = (status: string, isWebhook: boolean) => {
    if (isWebhook) {
      return status === "completed" || status === "authorized";
    }
    return status === "pending" || status === "authorized";
  };

  return {
    async processWebhook(payload: BoltTransactionWebhook) {
      const transaction = payload.data;
      const paymentLink = payload.data.payment_link as GetPaymentLinkRequest;
      const user = validateUser(paymentLink.user_id);

      if (!user) {
        return;
      }

      // Process gems for successful transactions
      if (shouldProcessGems(transaction.status, true)) {
        await handleSuccessfulTransaction(user, paymentLink);
      } else if (payload.type === "failed_payments") {
        // Handle failed payments
      } else if (payload.type === "credit") {
        // Handle refunds
      }

      const upsertedTransaction = db.upsertTransaction({
        userId: user.id,
        boltPaymentLinkId: paymentLink.id,
        status: transaction.status,
        totalAmount: {
          value: transaction.amount.amount,
          currency: transaction.amount.currency,
        },
      });

      logTransactionCompletion(transaction, user);
      return upsertedTransaction;
    },

    async processPaymentLinkRequest({
      payment_link_properties: paymentLink,
      transaction,
    }: GetPaymentLinkResponse) {
      const user = validateUser(paymentLink.user_id);

      if (!user) {
        return;
      }
      if (!transaction) {
        return;
      }

      // Process gems for successful transactions
      if (shouldProcessGems(transaction.status, false)) {
        await handleSuccessfulTransaction(user, paymentLink);
      } else if (transaction.status === "failed") {
        // Handle failed payments
      }
      // TODO: transaction missing properties to determine it's a refund

      const upsertedTransaction = db.upsertTransaction({
        userId: user.id,
        boltPaymentLinkId: transaction.reference, // Using transaction reference as fallback
        status: transaction.status as any, // Type assertion for demo
        totalAmount: {
          value: paymentLink.item.price,
          currency: paymentLink.item.currency,
        },
      });

      logTransactionCompletion(transaction, user);
      return upsertedTransaction;
    },
  };
};

export const TransactionService = createTransactionService(db);
