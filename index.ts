import { BoltClient } from "./src/client";
import { ProductsAPI } from "./src/endpoints/products";
import { SubscriptionsAPI } from "./src/endpoints/subscriptions";

export class BoltSDK {
  public subscriptions: SubscriptionsAPI;
  public products: ProductsAPI;

  constructor(apiKey: string, publishableKey: string, baseURL?: string) {
    const client = new BoltClient(apiKey, publishableKey, baseURL);
    this.subscriptions = new SubscriptionsAPI(client);
    this.products = new ProductsAPI(client);
  }
}

export default BoltSDK;
