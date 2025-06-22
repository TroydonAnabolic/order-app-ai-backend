import { Company } from "./company";
import { InviteCode } from "./invite-code";
import { Order } from "./order";

export type UserRole = "SUPER_ADMIN" | "COMPANY_ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  firebaseUid: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
  companies: Company[];
  createdCompanies: Company[];
  orders: Order[];
  createdAt: string;
  inviteCodesUsed: InviteCode[];
}
