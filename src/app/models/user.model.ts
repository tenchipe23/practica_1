import { Address, PaymentMethod } from './index';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  savedAddresses?: Address[];
  savedPaymentMethods?: PaymentMethod[];
  role?: 'user' | 'admin';
  profileImage?: string;
  createdAt?: Date;
  address?: string;
  profileImageUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData extends LoginCredentials {
  confirmPassword: string;
  name: string;
}
