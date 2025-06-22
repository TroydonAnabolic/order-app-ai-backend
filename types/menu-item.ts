import { Company } from "./company";
import { OrderItem } from "./order";

export interface MenuItem {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stripeProductId?: string;
  stripePricingId?: string;
  createdAt: string;
  company: Company;
  orderItems: OrderItem[];
}
