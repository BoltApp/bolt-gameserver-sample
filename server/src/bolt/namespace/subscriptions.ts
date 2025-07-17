import { BoltEndpoints } from "../bolt-endpoints";
import type { Subscription, SubscriptionOrder } from "../types";

export class SubscriptionsAPI {
  private readonly boltApi: BoltEndpoints;
  
  constructor(boltApi: BoltEndpoints) {
    this.boltApi = boltApi;
  }

  async getAllForUser(email: string): Promise<Subscription[]> {
    const response = await this.boltApi.instance.get(
      `/subscriptions?emails=${email}`
    );
    return response.data.subscriptions ?? [];
  }

  async get(id: string): Promise<Subscription> {
    const response = await this.boltApi.instance.get(`/subscriptions/${id}`);
    return response.data;
  }

  async getOrders(ids: number[]): Promise<SubscriptionOrder[]> {
    const response = await this.boltApi.instance.get(`/subscriptions/orders?subscription_ids=${ids.join(',')}`);
    return response.data.orders ?? [];
  }

  async cancel(id: string): Promise<void> {
    await this.boltApi.instance.post(`/subscriptions/${id}/cancel`);
  }
}
