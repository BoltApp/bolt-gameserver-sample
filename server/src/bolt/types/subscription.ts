import type { Plan } from './product';

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

export interface SubscriptionOrder  {
  id: string;
  subscription_id: string;
  order_id: number;
  transaction_reference: string;
  placement_time: string;
  status: string;
  created_at: string;
  updated_at: string;
}
