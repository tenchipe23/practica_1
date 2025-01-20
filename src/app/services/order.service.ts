import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Order, ShippingAddress, PaymentMethod } from '../models';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private savedAddressesSubject = new BehaviorSubject<ShippingAddress[]>([]);
  private savedPaymentMethodsSubject = new BehaviorSubject<PaymentMethod[]>([]);

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private dataService: DataService
  ) {
    // Load saved data from local storage
    this.loadSavedData();
    this.initializeSampleData();
  }

  private loadSavedData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Load user's past orders, addresses, and payment methods
      const savedOrders = JSON.parse(
        localStorage.getItem(`orders_${user.id}`) || '[]'
      );
      const savedAddresses = JSON.parse(
        localStorage.getItem(`addresses_${user.id}`) || '[]'
      );
      const savedPaymentMethods = JSON.parse(
        localStorage.getItem(`payment_methods_${user.id}`) || '[]'
      );

      this.ordersSubject.next(savedOrders);
      this.savedAddressesSubject.next(savedAddresses);
      this.savedPaymentMethodsSubject.next(savedPaymentMethods);
    }
  }

  private initializeSampleData() {
    // Add initialization logic if needed
  }

  getOrders(): Observable<Order[]> {
    return this.ordersSubject.asObservable();
  }

  getSavedAddresses(): Observable<ShippingAddress[]> {
    return this.savedAddressesSubject.asObservable();
  }

  getSavedPaymentMethods(): Observable<PaymentMethod[]> {
    return this.savedPaymentMethodsSubject.asObservable();
  }

  createOrder(order: Order): Observable<Order> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return throwError(() => new Error('No authenticated user'));
    }

    const newOrder: Order = {
      ...order,
      id: this.generateOrderId(),
      userId: user.id?.toString() || '',
      orderDate: new Date()
    };

    const currentOrders = this.getOrdersFromLocalStorage();
    currentOrders.push(newOrder);
    this.saveOrdersToLocalStorage(currentOrders);
    this.ordersSubject.next(currentOrders);

    return of(newOrder);
  }

  saveShippingAddress(address: ShippingAddress): ShippingAddress | null {
    const user = this.authService.getCurrentUser();
    if (!user) return null;

    const currentAddresses = this.savedAddressesSubject.value;
    const existingAddressIndex = currentAddresses.findIndex(
      a => this.addressesMatch(a, address)
    );

    const newAddress: ShippingAddress = {
      ...address,
      id: address.id || this.generateAddressId(),
      phoneNumber: address.phoneNumber || user.phoneNumber || ''
    };

    if (existingAddressIndex === -1) {
      currentAddresses.push(newAddress);
      this.savedAddressesSubject.next(currentAddresses);
      localStorage.setItem(
        `addresses_${user.id}`, 
        JSON.stringify(currentAddresses)
      );
    }

    return newAddress;
  }

  private generateAddressId(): string {
    return `ADDRESS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderId(): string {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getOrdersFromLocalStorage(): Order[] {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    return JSON.parse(
      localStorage.getItem(`orders_${user.id}`) || '[]'
    );
  }

  private saveOrdersToLocalStorage(orders: Order[]) {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    localStorage.setItem(
      `orders_${user.id}`, 
      JSON.stringify(orders)
    );
  }

  private addressesMatch(a1: ShippingAddress, a2: ShippingAddress): boolean {
    return a1.streetAddress === a2.streetAddress &&
           a1.city === a2.city &&
           a1.state === a2.state &&
           a1.postalCode === a2.postalCode &&
           a1.country === a2.country;
  }

  savePaymentMethod(paymentMethod: PaymentMethod) {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const currentPaymentMethods = this.savedPaymentMethodsSubject.value;
    const existingMethodIndex = currentPaymentMethods.findIndex(
      m => m.lastFourDigits === paymentMethod.lastFourDigits
    );

    if (existingMethodIndex === -1) {
      const newPaymentMethod: PaymentMethod = {
        ...paymentMethod,
        id: this.generatePaymentMethodId()
      };

      currentPaymentMethods.push(newPaymentMethod);
      this.savedPaymentMethodsSubject.next(currentPaymentMethods);
      localStorage.setItem(
        `payment_methods_${user.id}`, 
        JSON.stringify(currentPaymentMethods)
      );
    }
  }

  private generatePaymentMethodId(): string {
    return `PAYMENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
