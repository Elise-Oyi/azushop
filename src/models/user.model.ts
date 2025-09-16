// User interface
export interface User {
  email: string;
  fullname: string;
  role: "customer" | "admin";
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}