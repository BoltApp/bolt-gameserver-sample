import { BoltEndpoints } from "../bolt-endpoints";
import type { Product } from "../types";

// https://help.bolt.com/api-subscriptions/
export class ProductsAPI {
  private client: BoltEndpoints;

  constructor(client: BoltEndpoints) {
    this.client = client;
  }

  async getAll(): Promise<Product[]> {
    const response = await this.client.instance.get("/subscriptions/products");
    return response.data;
  }

  async get(id: string): Promise<Product> {
    const response = await this.client.instance.get(
      `/subscriptions/products/${id}`
    );
    return response.data;
  }
}
