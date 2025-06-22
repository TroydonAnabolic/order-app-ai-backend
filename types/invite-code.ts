import { User } from "./user";

export interface InviteCode {
  id: string;
  code: string;
  isUsed: boolean;
  createdAt: string;
  usedById?: string;
  usedBy?: User;
}
