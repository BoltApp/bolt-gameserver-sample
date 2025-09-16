type Merchant = any;
type MerchantDivision = any;
type TransactionProperties = any;
type ReviewTicket = any;
type ChargebackDetails = any;
type TimelineEntry = any;
type CustomerListStatus = any;
type AddressChangeRequestMetadata = any;

export interface Transaction {
  id: string;
  type: string;
  processor: "vantiv";
  date: number;
  reference: string;
  status: string;
  from_consumer: Consumer;
  to_consumer: Consumer;
  from_credit_card: CreditCard;
  amount: Amount;
  authorization: Authorization;
  captures: null;
  merchant_division: MerchantDivision;
  merchant: Merchant;
  transaction_properties: TransactionProperties;
  indemnification_decision: string;
  indemnification_reason: string;
  risk_score: number;
  risk_review_status: string;
  splits: Split[];
  review_ticket: ReviewTicket;
  adjust_transactions: any[];
  auth_verification_status: string;
  void_cause: string;
  chargeback_details: ChargebackDetails;
  order: Order;
  refunded_amount: Amount;
  refund_transactions: any[];
  refund_transaction_ids: any[];
  source_transaction: null;
  timeline: TimelineEntry[];
  customer_list_status: CustomerListStatus;
  address_change_request_metadata: AddressChangeRequestMetadata;
}

interface Order {
    token: string;
    cart: {
      order_reference: string;
      display_id: string;
      currency: {
        currency: string;
        currency_symbol: string;
      };
      subtotal_amount: Amount | null;
      total_amount: Amount;
      tax_amount: Amount;
      discount_amount: Amount;
      subscriptions_amount: Amount;
      billing_address: Address;
      items: {
        reference: string;
        name: string;
        description: string;
        total_amount: Amount;
        unit_price: Amount;
        quantity: number;
        brand: string;
        image_url: string;
        type: string;
        taxable: boolean;
        properties: {
          name: string;
          value: string;
          display: boolean;
        }[];
        shipment_type: string;
        merchant_product_id: string;
        merchant_variant_id: string;
        subscription_plan_id: string;
      }[];
      metadata: {
        tipserCheckoutID: string;
        tipserSessionID: string;
      };
    };
    external_data: Record<string, any>;
  }

interface Consumer {
  id: string;
  first_name: string;
  last_name: string;
  phones?: Phone[];
  emails: Email[];
  email_verified: boolean;
  platform_account_status: string;
}

interface Phone {
  id: string;
  number: string;
  country_code: string;
  status: string;
  priority: string;
}

interface Email {
  id: string;
  address: string;
  status: string;
  priority: string;
}

interface CreditCard {
  id: string;
  last4: string;
  bin: string;
  expiration: number;
  network: string;
  token_type: string;
  priority: string;
  display_network: string;
  icon_asset_path: string;
  status: string;
  card_type: string;
  funded_with_crypto: boolean;
  billing_address: Address;
}

interface Amount {
  amount: number;
  currency: string;
  currency_symbol: string;
}

interface Authorization {
  auth: string;
  avs_response: string;
  cvv_response: string;
  external_transaction_id: string;
  reason: string;
  status: string;
}

interface Split {
  amount: Amount;
  type: string;
}

interface Address {
  id: string;
  street_address1: string;
  locality: string;
  region: string;
  region_code: string;
  postal_code: string;
  country_code: string;
  country: string;
  name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email_address: string;
  priority: string;
}
