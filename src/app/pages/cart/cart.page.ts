import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { Cart, CartItem } from '../../models';
import { ToastController } from '@ionic/angular'; 
import { Product } from '../../models'; // added import for Product

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
    discount: 0 
  };

  constructor(
    private cartService: CartService,
    private navCtrl: NavController,
    private toastController: ToastController 
  ) {}

  ngOnInit() {
    this.cartService.getCurrentCart().subscribe(cart => {
      this.cart = cart;
    });
  }

  increaseQuantity(product: Product) {
    console.group('Increase Quantity');
    console.log('Attempting to increase quantity for:', {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock
    });

    const currentQuantity = this.cartService.getProductQuantityInCart(product);
    
    console.log('Current Cart Details:', {
      currentQuantity: currentQuantity,
      maxStock: product.stock
    });

    if (currentQuantity < product.stock) {
      this.cartService.updateQuantity(product, 1);
      console.log(`Successfully increased quantity for ${product.name}`);
    } else {
      console.warn(`Cannot increase quantity. Reached stock limit for ${product.name}`);
      this.presentStockLimitToast(product);
    }

    console.groupEnd();
  }

  decreaseQuantity(product: Product) {
    console.group('Decrease Quantity');
    console.log('Attempting to decrease quantity for:', {
      productId: product.id,
      productName: product.name
    });

    const currentQuantity = this.cartService.getProductQuantityInCart(product);
    
    console.log('Current Cart Details:', {
      currentQuantity: currentQuantity
    });

    if (currentQuantity > 1) {
      this.cartService.updateQuantity(product, -1);
      console.log(`Successfully decreased quantity for ${product.name}`);
    } else {

      console.log(`Removing ${product.name} from cart`);
      this.cartService.removeFromCart(product);
    }

    console.groupEnd();
  }

  removeItem(product: Product) {
    console.group('Remove Item from Cart');
    console.log('Attempting to remove product:', {
      productId: product.id,
      productName: product.name
    });

    try {
      this.cartService.removeFromCart(product);
      console.log(`Successfully removed ${product.name} from cart`);
      
      this.presentRemoveToast();
    } catch (error) {
      console.error('Error removing product from cart:', error);
    }

    console.groupEnd();
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
    if (this.cart.items.length > 0) {
      this.navCtrl.navigateForward('/checkout');
    } else {
      this.presentEmptyCartToast();
    }
  }

  get cartItems() {
    return this.cartService.getCartItems();
  }

  getCartTotal(): number {
    console.group(' Get Cart Total');
    const total = this.cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0);
    
    console.log('Cart Total Calculation:', {
      items: this.cartItems.map(item => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      })),
      total: total
    });

    console.groupEnd();
    return total;
  }

  getDiscount(): number {
    console.group(' Get Discount');
    const discount = this.cartService.getDiscount() || 0;
    
    console.log('Discount Calculation:', {
      discount: discount
    });

    console.groupEnd();
    return discount;
  }

  getFinalTotal(): number {
    console.group(' Get Final Total');
    const cartTotal = this.getCartTotal();
    const discount = this.getDiscount();
    const finalTotal = Math.max(cartTotal - discount, 0);
    
    console.log('Final Total Calculation:', {
      cartTotal: cartTotal,
      discount: discount,
      finalTotal: finalTotal
    });

    console.groupEnd();
    return finalTotal;
  }

  calculateTotal(): number {
    return this.getFinalTotal();
  }

  calculateDiscount(): number {
    return this.getDiscount();
  }

  private presentStockLimitToast(product: Product) {
    this.toastController.create({
      message: `Máximo de ${product.stock} unidades disponibles para ${product.name}`,
      duration: 2000,
      color: 'warning',
      position: 'bottom'
    }).then(toast => toast.present());
  }

  async presentRemoveToast() {
    const toast = await this.toastController.create({
      message: 'Producto eliminado del carrito',
      duration: 2000,
      color: 'secondary',
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