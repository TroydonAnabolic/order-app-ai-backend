export type Reservation = {
  id?: string;
  companyId?: string;
  userId?: string;
  name: string;
  phoneNumber: string;
  diningDate: string; // ISO date string
  preferredTime: string; // e.g. "17:00"
  seatNumbers?: string; // e.g. "30, 32, 38"
  specialInstructions?: string;
  createdAt: string; // ISO date string
};
