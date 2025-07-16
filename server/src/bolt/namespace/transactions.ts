import { BoltEndpoints } from "../bolt-endpoints";
import type { Transaction } from "../types";

export class TransactionsAPI {
  private readonly boltApi: BoltEndpoints;
  
  constructor(boltApi: BoltEndpoints) {
    this.boltApi = boltApi;
  }

  async get(reference: string): Promise<Transaction> {
    const response = await this.boltApi.instance.get(`/merchant/transactions/${reference}`);
    return response.data;
  }
}
