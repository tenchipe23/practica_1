export * from './user.model';
export * from './product.model';

export interface Address {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fullName?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal';
  cardNumber?: string;
  cardHolderName: string;
  expiryDate?: string;
  cvv?: string;
  lastFourDigits?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  stock: number;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  savedAddresses?: ShippingAddress[];
  savedPaymentMethods?: PaymentMethod[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  discount?: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  orderDate: Date;
  status: string;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  product: Product;
  discountPercentage: number;
  startDate?: Date;
  endDate?: Date;
}
