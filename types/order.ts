import { Company } from "./company";
import { MenuItem } from "./menu-item";
import { User } from "./user";

export interface Order {
  id: string;
  userId?: string;
  companyId: string;
  customerName: string;
  phoneNumber: string;
  diningType: string;
  seatNo?: string;
  preferredDiningTime?: string;
  preferredDeliveryTime?: string;
  preferredPickupTime?: string;
  deliveryAddress?: string;
  totalOrderCost: number;
  specialInstructions?: string;
  orderDate: string;
  createdAt: string;
  user?: User;
  company: Company;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  itemId?: string;
  itemName: string;
  size: string;
  quantity: number;
  pricePerItem: number;
  totalPrice: number;
  specialInstructions?: string;
  order: Order;
  item?: MenuItem;
}
