import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models';
import { ToastController } from '@ionic/angular'; // Añade ToastController

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CartPage implements OnInit {
  cart: Cart = { 
    items: [], 
    total: 0,
    discount: 0 // Añade descuento
  };

  constructor(
    private cartService: CartService,
    private navCtrl: NavController,
    private toastController: ToastController // Inyecta ToastController
  ) {}

  ngOnInit() {
    this.cartService.getCurrentCart().subscribe(cart => {
      this.cart = cart;
    });
  }

  updateQuantity(item: CartItem, change: number) {
    const newQuantity = item.quantity + change;
    
    // Verifica límites de stock
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      this.cartService.updateQuantity(item.product.id, newQuantity);
    } else if (newQuantity <= 0) {
      // Si la cantidad es 0 o negativa, elimina el producto
      this.removeItem(item.product.id);
    } else {
      // Muestra un toast si se intenta añadir más productos de los disponibles
      this.presentStockLimitToast(item.product);
    }
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
    this.presentRemoveToast();
  }

  clearCart() {
    this.cartService.clearCart();
    this.presentClearCartToast();
  }

  navigateToProducts() {
    this.navCtrl.navigateRoot('/products');
  }

  navigateBack() {
    this.navCtrl.back();
  }

  navigateToCheckout() {
    // Verifica si hay productos en el carrito antes de navegar
    if (this.cart.items.length > 0) {
      this.navCtrl.navigateForward('/checkout');
    } else {
      this.presentEmptyCartToast();
    }
  }

  getCartTotal(): number {
    return this.cart.items.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
  }

  // Método para calcular descuentos
  getDiscount(): number {
    return this.cart.discount || 0;
  }

  // Método para calcular el total final
  getFinalTotal(): number {
    return this.getCartTotal() - this.getDiscount();
  }

  // Toasts para mejorar la experiencia de usuario
  async presentStockLimitToast(product: any) {
    const toast = await this.toastController.create({
      message: `Solo quedan ${product.stock} unidades de ${product.name}`,
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    });
    toast.present();
  }

  async presentRemoveToast() {
    const toast = await this.toastController.create({
      message: 'Producto eliminado del carrito',
      duration: 2000,
      color: 'danger',
      position: 'bottom'
    });
    toast.present();
  }

  async presentClearCartToast() {
    const toast = await this.toastController.create({
      message: 'Carrito vaciado',
      duration: 2000,
      color: 'secondary',
      position: 'bottom'
    });
    toast.present();
  }

  async presentEmptyCartToast() {
    const toast = await this.toastController.create({
      message: 'Añade productos al carrito primero',
      duration: 2000,
      color: 'primary',
      position: 'bottom'
    });
    toast.present();
  }
}