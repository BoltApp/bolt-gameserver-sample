import { BoltEndpoints } from "./bolt-endpoints";
import { SubscriptionsAPI } from "./namespace/subscriptions";
import { ProductsAPI } from "./namespace/products";

export class BoltApi {
  public subscriptions: SubscriptionsAPI;
  public products: ProductsAPI;

  constructor(apiKey: string, publishableKey: string, baseURL?: string) {
    const client = new BoltEndpoints(apiKey, publishableKey, baseURL);
    this.subscriptions = new SubscriptionsAPI(client);
    this.products = new ProductsAPI(client);
  }
}

export default BoltApi;
