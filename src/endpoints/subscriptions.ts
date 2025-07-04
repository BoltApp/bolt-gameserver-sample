import { BoltClient } from "../client";
import { Subscription } from "../types";

export class SubscriptionsAPI {
  constructor(private client: BoltClient) {}

  async getAllSubscriptionsForUser(email: string): Promise<Subscription[]> {
    const response = await this.client.instance.get(
      `/subscriptions?emails=${email}`
    );
    return response.data;
  }

  async getSubscription(id: string): Promise<Subscription> {
    const response = await this.client.instance.get(`/subscriptions/${id}`);
    return response.data;
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.client.instance.post(`/subscriptions/${id}/cancel`);
  }
}
