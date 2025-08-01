import { BoltEndpoints } from "./bolt-endpoints";
import { SubscriptionsAPI } from "./namespace/subscriptions";
import { ProductsAPI } from "./namespace/products";
import { TransactionsAPI } from "./namespace/transactions";
import { GamingAPI } from "./namespace/gaming";

export class BoltApi {
  public subscriptions: SubscriptionsAPI;
  public products: ProductsAPI;
  public transactions: TransactionsAPI;
  public gaming: GamingAPI;

  constructor(apiKey: string, publishableKey: string, baseURL?: string) {
    const client = new BoltEndpoints(apiKey, publishableKey, baseURL);
    this.subscriptions = new SubscriptionsAPI(client);
    this.products = new ProductsAPI(client);
    this.transactions = new TransactionsAPI(client);
    this.gaming = new GamingAPI(client);
  }
}

export default BoltApi;
