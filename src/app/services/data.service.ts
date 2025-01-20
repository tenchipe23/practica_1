import { Injectable } from '@angular/core';
import { 
  User, 
  Product, 
  Order, 
  Address, 
  PaymentMethod, 
  ShippingAddress, 
  Category, 
  CartItem, 
  Promotion 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor() {}

  // Static Users
  private users: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@example.com',
      password: 'password123',
      phoneNumber: '5551234567',
      savedAddresses: [{
        streetAddress: 'Calle Falsa 123',
        city: 'Ciudad Último Modelo',
        state: 'Estado',
        postalCode: '12345',
        country: 'México',
        fullName: '',
        phoneNumber: ''
      }],
      savedPaymentMethods: [{
        id: 'pm1',
        type: 'credit',
        cardNumber: '1234567890123456',
        cardHolderName: 'Juan Pérez',
        expiryDate: '12/25',
        cvv: '123',
        lastFourDigits: '3456'
      }]
    }
  ];

  // Static Products
  private products: Product[] = [
    {
      id: 1,
      name: 'Producto 1',
      price: 99.99,
      originalPrice: 129.99,
      description: 'Cámara profesional con alta resolución',
      image: 'assets/products/camera.jpg',
      category: 'Electronics',
      stock: 10,
      inStock: true
    },
    {
      id: 2,
      name: 'Auriculares Inalámbricos',
      description: 'Auriculares con cancelación de ruido',
      price: 199.99,
      image: 'assets/products/headphones.jpg',
      category: 'Audio',
      stock: 15,
      inStock: true
    },
    {
      id: 3,
      name: 'Portátil ligera',
      description: 'Procesador de última generación',
      price: 899.99,
      image: 'assets/products/laptop.jpg',
      category: 'Computers',
      stock: 5,
      inStock: true
    }
  ];

  // Static Categories
  private categories: Category[] = [
    {
      id: 1,
      name: 'Electronics',
      icon: 'laptop'
    },
    {
      id: 2,
      name: 'Audio',
      icon: 'shirt'
    },
    {
      id: 3,
      name: 'Computers',
      icon: 'book'
    }
  ];

  // Static Orders
  private orders: Order[] = [
    {
      id: 'order1',
      userId: '1',
      items: [
        {
          product: this.products[0],
          quantity: 2
        }
      ],
      total: 199.98,
      discount: 20,
      shippingAddress: {
        fullName: 'Juan Pérez',
        streetAddress: '123 Sample St',
        city: 'Sample City',
        state: 'Sample State',
        postalCode: '12345',
        country: 'Mexico',
        phoneNumber: '5551234567'
      },
      paymentMethod: {
        id: 'payment1',
        type: 'credit',
        lastFourDigits: '1234',
        cardHolderName: 'Juan Pérez'
      },
      orderDate: new Date(),
      status: 'pending'
    },
    {
      id: 'order2',
      userId: '1',
      items: [
        {
          product: this.products[1],
          quantity: 1
        },
        {
          product: this.products[2],
          quantity: 3
        }
      ],
      total: 299.97,
      discount: 0,
      shippingAddress: {
        fullName: 'Juan Pérez',
        streetAddress: '123 Sample St',
        city: 'Sample City',
        state: 'Sample State',
        postalCode: '12345',
        country: 'Mexico',
        phoneNumber: '5551234567'
      },
      paymentMethod: {
        id: 'payment2',
        type: 'paypal',
        cardHolderName: 'Juan Pérez',
        lastFourDigits: '0000'
      },
      orderDate: new Date(),
      status: 'delivered'
    }
  ];

  // Static Promotions
  private promotions: Promotion[] = this.generateSamplePromotions();

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | null {
    return this.getProducts().find(product => product.id === id) || null;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getPromotions(): Promotion[] {
    return this.promotions;
  }

  getUsers(): User[] {
    return this.users;
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  private generateSamplePromotions(): Promotion[] {
    return [
      {
        id: 1,
        title: 'Smartphone Discount',
        description: 'Get 20% off on latest smartphones',
        product: this.products[0],
        discountPercentage: 20
      },
      {
        id: 2,
        title: 'Headphones Sale',
        description: 'Noise-cancelling headphones at a great price',
        product: this.products[1],
        discountPercentage: 15
      },
      {
        id: 3,
        title: 'Laptop Offer',
        description: 'Powerful laptop with amazing features',
        product: this.products[2],
        discountPercentage: 10
      }
    ];
  }
}
