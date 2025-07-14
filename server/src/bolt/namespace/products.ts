import { BoltEndpoints } from "../bolt-endpoints";
import { Product } from "../bolt-types";

export class ProductsAPI {
  constructor(private client: BoltEndpoints) {}

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
