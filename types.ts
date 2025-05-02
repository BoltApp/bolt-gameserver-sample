// A product is a commercial item, these are what customers are purchasing.
export interface Product {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  plans: Plan[];
  images: string[];
}

// A plan is a way to pay for a product. It can be a recurring payment or a one time payment.
export interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  frequency: number;
  product_id: number;
  frequency_unit: string; // for one time payments, the frequency_unit would be "one_time"
  unit_price: number;
  images: string[];
  checkout_link: string;
}

// A subscription is a customer's subscription to a product. These can be used to track ownership and recurring payments.
export interface Subscription {
  id: number;
  created_at: string;
  updated_at: string;
  consumer_id: number;
  subscription_plan_id: number;
  quantity: number;
  status: string;
  plan: Plan;
}
