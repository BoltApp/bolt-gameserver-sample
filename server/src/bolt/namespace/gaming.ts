import { PaymentLinkTransactionResponse } from "../../types/shared";
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

  async getPaymentLinkTransaction(paymentLinkId: string): Promise<PaymentLinkTransactionResponse> {
    const response = await this.client.instance.get(`/gaming/payment_links/${paymentLinkId}`);
    return response.data;
  }
}
