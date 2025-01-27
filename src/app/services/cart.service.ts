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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart);
    }
  }

  getCurrentCart(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }

  getCurrentCartValue(): Cart {
    return this.cart;
  }

  private isExactSameProduct(product1: Product, product2: Product): boolean {
    return (
      product1.id === product2.id &&
      product1.name === product2.name &&
      product1.price === product2.price
    );
  }

  private findCartItemIndex(product: Product): number {
    return this.cart.items.findIndex(
      item => this.isExactSameProduct(item.product, product)
    );
  }

  updateQuantity(product: Product, change: number) {
    console.group('Update Quantity Process');
    console.log('Attempting to update quantity:', {
      productId: product.id,
      productName: product.name,
      change: change,
      currentCartItems: this.cart.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      }))
    });

    const itemIndex = this.findCartItemIndex(product);
    
    if (itemIndex > -1) {
      const item = this.cart.items[itemIndex];
      const newQuantity = item.quantity + change;

      console.log('Current Item Details:', {
        productName: item.product.name,
        currentQuantity: item.quantity,
        proposedNewQuantity: newQuantity,
        maxStock: item.product.stock
      });

      if (newQuantity > 0 && newQuantity <= item.product.stock) {
        item.quantity = newQuantity;
        console.log(`Updated ${item.product.name} quantity to ${newQuantity}`);
        
        this.updateTotal();
        this.cartSubject.next(this.cart);
        this.saveCart(this.cart);
      } else if (newQuantity <= 0) {
        console.log(`Removing ${item.product.name} from cart`);
        this.removeFromCart(product);
      } else {
        console.warn(`Cannot exceed stock limit for ${item.product.name}`);
        this.presentStockLimitToast(item.product);
      }
    } else {
      console.warn(`Product ${product.name} not found in cart`);
    }

    console.groupEnd();
  }

  removeFromCart(product: Product) {
    console.group('Remove From Cart');
    console.log('Attempting to remove product:', {
      productId: product.id,
      productName: product.name
    });

    const initialLength = this.cart.items.length;
    this.cart.items = this.cart.items.filter(
      item => !this.isExactSameProduct(item.product, product)
    );

    if (this.cart.items.length < initialLength) {
      console.log(`Successfully removed ${product.name} from cart`);
      this.updateTotal();
      this.cartSubject.next(this.cart);
      this.saveCart(this.cart);
    } else {
      console.warn(`Product ${product.name} not found in cart`);
    }

    console.groupEnd();
  }

  getProductQuantityInCart(product: Product): number {
    const existingItem = this.cart.items.find(
      item => this.isExactSameProduct(item.product, product)
    );
    const quantity = existingItem ? existingItem.quantity : 0;
    console.log(`Current cart quantity for ${product.name}: ${quantity}`);
    return quantity;
  }

  addToCart(product: Product, quantity: number = 1) {
    console.group('Add to Cart Process');
    console.log('Attempting to add product:', {
      productId: product?.id,
      productName: product?.name,
      quantity: quantity,
      currentStock: product?.stock
    });

    if (!product) {
      console.error('CART ERROR: Cannot add undefined product');
      console.groupEnd();
      return;
    }

    if (quantity <= 0) {
      console.warn('CART WARNING: Invalid quantity. Must be greater than 0');
      console.groupEnd();
      return;
    }

    console.log('Current Cart State Before Addition:', {
      totalItems: this.cart.items.length,
      currentItems: this.cart.items.map(item => ({
        id: item.product.id, 
        name: item.product.name, 
        quantity: item.quantity
      }))
    });

    const existingItemIndex = this.findCartItemIndex(product);
    
    if (existingItemIndex > -1) {
      const currentItem = this.cart.items[existingItemIndex];
      const newQuantity = currentItem.quantity + quantity;
      
      if (newQuantity <= product.stock) {
        currentItem.quantity = newQuantity;
        console.log(`Updated existing item quantity to ${newQuantity}`);
      } else {
        currentItem.quantity = product.stock;
        console.warn(`Reached maximum stock limit of ${product.stock}`);
        this.presentStockLimitToast(product);
      }
    } else {
      const newCartItem = { 
        product, 
        quantity: Math.min(quantity, product.stock) 
      };
      this.cart.items.push(newCartItem);
      console.log('Added new item to cart:', newCartItem);
    }

    console.log('Cart State After Addition:', {
      totalItems: this.cart.items.length,
      currentItems: this.cart.items.map(item => ({
        id: item.product.id, 
        name: item.product.name, 
        quantity: item.quantity
      }))
    });

    this.updateTotal();
    
    this.cartSubject.next(this.cart);
    this.saveCart(this.cart);

    console.groupEnd();
  }

  private saveCart(cart: Cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  clearCart() {
    this.cart = {
      items: [],
      total: 0,
      discount: 0
    };
    this.cartSubject.next(this.cart);
    localStorage.removeItem('cart');
  }

  private async presentAddToCartToast(product: Product) {
    try {
      const toast = await this.toastController.create({
        message: `${product.name} añadido al carrito`,
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      toast.present();
      console.log('Toast presented for adding product');
    } catch (error) {
      console.error('Error presenting add to cart toast:', error);
    }
  }

  private async presentRemoveFromCartToast(product: Product) {
    const toast = await this.toastController.create({
      message: `${product.name} eliminado del carrito`,
      duration: 2000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  private presentStockLimitToast(product: Product) {
    this.toastController.create({
      message: `Máximo de ${product.stock} unidades disponibles para ${product.name}`,
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    }).then(toast => toast.present());
  }

  private updateTotal() {
    console.group('Update Cart Total');
    
    this.cart.total = this.cart.items.reduce((total, item) => {
      const itemTotal = item.product.price * item.quantity;
      console.log(`Product: ${item.product.name}, Quantity: ${item.quantity}, Price: ${item.product.price}, Item Total: ${itemTotal}`);
      return total + itemTotal;
    }, 0);

    const discount = this.getDiscount();
    this.cart.total = Math.max(this.cart.total - discount, 0);

    console.log('Cart Total Updated:', {
      total: this.cart.total,
      discount: discount
    });

    console.groupEnd();
  }

  getCartItems(): CartItem[] {
    console.group('Get Cart Items');
    console.log('Current Cart Items:', this.cart.items.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    })));
    console.groupEnd();
    return this.cart.items;
  }

  getDiscount(): number {
    console.group('Get Discount');
    const discount = this.cart.discount || 0;
    
    console.log('Discount Calculation:', {
      discount: discount
    });

    console.groupEnd();
    return discount;
  }

  setDiscount(discount: number) {
    console.group('Set Discount');
    this.cart.discount = Math.max(discount, 0);
    
    console.log('Discount Updated:', {
      newDiscount: this.cart.discount
    });

    console.groupEnd();
  }

  getUniqueProductCount(): number {
    return this.cart.items.length;
  }

  getTotalProductQuantity(): number {
    return this.cart.items.reduce((total, item) => total + item.quantity, 0);
  }
}