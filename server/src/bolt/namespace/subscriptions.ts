import { BoltEndpoints } from "../bolt-endpoints";
import { Subscription } from "../bolt-types";

export class SubscriptionsAPI {
  constructor(private boltApi: BoltEndpoints) {}

  async getAllForUser(email: string): Promise<Subscription[]> {
    const response = await this.boltApi.instance.get(
      `/subscriptions?emails=${email}`
    );
    return response.data;
  }

  async get(id: string): Promise<Subscription> {
    const response = await this.boltApi.instance.get(`/subscriptions/${id}`);
    return response.data;
  }

  async cancel(id: string): Promise<void> {
    await this.boltApi.instance.post(`/subscriptions/${id}/cancel`);
  }
}
