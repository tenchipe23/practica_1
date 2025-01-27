import { ShippingAddress, PaymentMethod } from './index';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData extends LoginCredentials {
  confirmPassword: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  password: string;
  phoneNumber: string;
  address?: string;
  savedAddresses?: ShippingAddress[];
  savedPaymentMethods?: PaymentMethod[];
  role?: 'user' | 'admin';
}

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  token: string;
  phoneNumber?: string;
  role?: 'user' | 'admin';
}
