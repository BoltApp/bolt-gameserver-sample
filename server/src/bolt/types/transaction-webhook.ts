export interface BoltSubscriptionWebhook {
  type: "subscription_created";
  object: "subscription";
  data: {
    internal_id: number;
    id: string;
    created_at: string;
    updated_at: string;
    merchant_name: string;
    consumer_id: number;
    email: string;
    quantity: number;
    price: number;
    currency: string;
    status: string;
    payment_method: {
      card_last_4: string;
      card_network: string;
    };
    plan: {
      internal_id: number;
      id: string;
      name: string;
      sku: string;
      created_at: string;
      updated_at: string;
      frequency: number;
      product_id: string;
      product_internal_id: number;
      frequency_unit: string;
    };
  };
}
