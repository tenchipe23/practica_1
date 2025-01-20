export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  inStock: boolean;
  discount?: number;
  quantity?: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discount?: number;
}

export interface Promotion {
  id: number;
  product: Product;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'apple_pay' | 'google_pay';
  lastFourDigits?: string;
  cardHolderName?: string;
}

export interface ShippingAddress {
  id?: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: CartItem[];
  total: number;
  discount?: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
}
