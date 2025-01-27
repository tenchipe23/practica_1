import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  User, 
  Product, 
  Category, 
  Order, 
  RegisterData, 
  LoginCredentials, 
  LoginResponse 
} from '../models';
import { ShippingAddress } from '../models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, credentials);
  }

  register(userData: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/register`, userData);
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, userData);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/change-password`, { 
      currentPassword, 
      newPassword 
    });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/account`);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  getProductById(id: number | string): Observable<Product | undefined> {
    const numericId = Number(id);
    
    console.log('Fetching product with ID:', numericId);
    
    if (isNaN(numericId) || numericId <= 0) {
      console.error('Invalid product ID:', id);
      return of(undefined);
    }
  
    return this.http.get<Product | undefined>(`${this.apiUrl}/products/${numericId}`).pipe(
      tap((product: Product | undefined) => console.log('Received product:', product)),
      catchError(error => {
        console.error('Error fetching product:', error);
        if (error.status === 404) {
          return of(undefined);
        }
        throw error;
      })
    );
  }

  getProductByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/category/${category}`);
  }

  getProductBySearchTerm(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products/search/${searchTerm}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  getCategoriesWithProducts(): Observable<string[]> {
    return this.getProducts().pipe(
      map(products => {
        // Get unique categories that have at least one product
        return [...new Set(
          products
            .map(p => p.category)
            .filter(category => category && typeof category === 'string')
        )];
      }),
      catchError(error => {
        console.error('Error fetching categories with products', error);
        return of([]);
      })
    );
  }

  createOrder(orderData: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, orderData);
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/my-orders`);
  }

  addShippingAddress(address: ShippingAddress): Observable<ShippingAddress> {
    return this.http.post<ShippingAddress>(`${this.apiUrl}/users/addresses`, address);
  }

  getShippingAddresses(): Observable<ShippingAddress[]> {
    return this.http.get<ShippingAddress[]>(`${this.apiUrl}/users/addresses`);
  }
}