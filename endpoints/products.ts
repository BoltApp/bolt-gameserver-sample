import { BoltClient } from '../client';
import { Product } from '../types';

export class ProductsAPI {
  constructor(private client: BoltClient) {}

  async getAllProducts(): Promise<Product[]> {
    const response = await this.client.instance.get('/subscriptions/products');
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.instance.get(`/subscriptions/products/${id}`);
    return response.data;
  }
}
