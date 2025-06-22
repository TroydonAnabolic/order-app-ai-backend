import { MenuItem } from "./menu-item";
import { Order } from "./order";
import { User } from "./user";

export interface Company {
  id: string;
  name: string;
  address?: string;
  shortCode: string;
  currency: string;
  items: MenuItem[];
  orders: Order[];
  admins: User[];
  createdById: string;
  createdBy: User;
  createdAt: string;
}
