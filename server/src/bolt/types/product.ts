export interface Product {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  plans: Plan[];
  images: string[];
}

export interface Plan {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  frequency: number;
  product_id: number;
  frequency_unit: string; // for one time payments, the frequency_unit would be "one_time"
  unit_price: number;
  images: string[];
  checkout_link: string;
}
