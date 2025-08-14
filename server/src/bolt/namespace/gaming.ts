import type { CreatePaymentLinkRequest, CreatePaymentLinkResponse, GetPaymentLinkResponse } from "@boltpay/bolt-js";

import { BoltEndpoints } from "../bolt-endpoints";

export class GamingAPI {
  private client: BoltEndpoints;

  constructor(client: BoltEndpoints) {
    this.client = client;
  }

  async createPaymentLink(data: CreatePaymentLinkRequest): Promise<CreatePaymentLinkResponse> {
    const response = await this.client.instance.post("/gaming/payment_links", data);
    return response.data;
  }

  async getPaymentLinkResponse(paymentLinkId: string): Promise<GetPaymentLinkResponse> {
    const response = await this.client.instance.get(`/gaming/payment_links/${paymentLinkId}`);
    return response.data;
  }
}
