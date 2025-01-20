import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, CartItem, Cart } from '../models';
import { DataService } from './data.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = {
    items: [],
    total: 0,
    discount: 0
  };

  private cartSubject = new BehaviorSubject<Cart>(this.cart);

  constructor(
    private dataService: DataService,
    private toastController: ToastController
  ) {
    // Load cart from local storage on initialization
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart);
    }
  }

  // Observable for cart state
  getCurrentCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  // Get current cart value
  getCurrentCartValue(): Cart {
    return this.cart;
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1) {
    // Encuentra el índice del producto existente en el carrito
    const existingItemIndex = this.cart.items.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex > -1) {
      // Si el producto ya existe, actualiza la cantidad
      const currentQuantity = this.cart.items[existingItemIndex].quantity;
      const newQuantity = currentQuantity + quantity;
      
      // Verifica que la nueva cantidad no exceda el stock
      if (newQuantity <= product.stock) {
        this.cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Muestra un toast si se intenta añadir más productos de los disponibles
        this.presentStockLimitToast(product);
        return;
      }
    } else {
      // Si es un producto nuevo, añádelo al carrito
      this.cart.items.push({ 
        product, 
        quantity: Math.min(quantity, product.stock) 
      });
    }

    this.updateTotal();
    this.cartSubject.next(this.cart);
    this.saveCart(this.cart);
    this.presentAddToCartToast(product);
  }

  // Remove product from cart
  removeFromCart(productId: number) {
    this.cart.items = this.cart.items.filter(item => item.product.id !== productId);
    this.updateTotal();
    this.cartSubject.next(this.cart);
    this.saveCart(this.cart);
  }

  // Update product quantity
  updateQuantity(productId: number, newQuantity: number) {
    const itemIndex = this.cart.items.findIndex(item => item.product.id === Number(productId));
    
    if (itemIndex > -1) {
      const product = this.cart.items[itemIndex].product;
      
      // Verifica que la nueva cantidad no exceda el stock
      if (newQuantity <= product.stock) {
        if (newQuantity === 0) {
          this.removeFromCart(Number(productId));
        } else {
          this.cart.items[itemIndex].quantity = newQuantity;
          this.updateTotal();
          this.cartSubject.next(this.cart);
          this.saveCart(this.cart);
        }
      } else {
        // Muestra un toast si se intenta añadir más productos de los disponibles
        this.presentStockLimitToast(product);
      }
    }
  }

  // Calculate cart total
  private updateTotal() {
    this.cart.total = this.cart.items.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );

    // Apply any potential discounts
    if (this.cart.items.length > 2) {
      // Example: 10% discount for 3+ items
      this.cart.discount = this.cart.total * 0.1;
      this.cart.total -= this.cart.discount;
    } else {
      this.cart.discount = 0;
    }
  }

  // Save cart to local storage
  private saveCart(cart: Cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  // Clear entire cart
  clearCart() {
    this.cart = {
      items: [],
      total: 0,
      discount: 0
    };
    this.cartSubject.next(this.cart);
    localStorage.removeItem('cart');
  }

  // Toast para mostrar cuando se añade un producto al carrito
  private async presentAddToCartToast(product: Product) {
    const toast = await this.toastController.create({
      message: `${product.name} añadido al carrito`,
      duration: 2000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  // Toast para mostrar cuando se alcanza el límite de stock
  private async presentStockLimitToast(product: Product) {
    const toast = await this.toastController.create({
      message: `Solo quedan ${product.stock} unidades de ${product.name}`,
      duration: 2000,
      color: 'warning',
      position: 'top'
    });
    toast.present();
  }
}