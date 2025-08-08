import { BoltEndpoints } from "../bolt-endpoints";
import type { PaymentLinkRequest, PaymentLinkResponse } from "../types";

export class GamingAPI {
  private client: BoltEndpoints;

  constructor(client: BoltEndpoints) {
    this.client = client;
  }

  async createPaymentLink(data: PaymentLinkRequest): Promise<PaymentLinkResponse> {
    const response = await this.client.instance.post("/gaming/payment_links", data);
    return response.data;
  }
}
