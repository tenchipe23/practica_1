 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { User, ShippingAddress, PaymentMethod, CartItem, Order } from '../../models';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    IonicModule,
    CurrencyPipe
  ]
})
export class CheckoutPage implements OnInit {
  currentStep = 1;
  shippingForm: FormGroup;
  paymentForm: FormGroup;
  savedAddresses: ShippingAddress[] = [];
  savedPaymentMethods: PaymentMethod[] = [];
  cart: { items: CartItem[], total: number } = { items: [], total: 0 };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {
    this.shippingForm = this.fb.group({
      fullName: ['', Validators.required],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });

    this.paymentForm = this.fb.group({
      cardType: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      cardHolderName: ['', Validators.required],
      expiryDate: ['', Validators.required],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });
  }

  ngOnInit() {
    this.cartService.getCurrentCart().subscribe(cart => {
      this.cart = cart;
    });
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.savedAddresses = currentUser.savedAddresses || [];
      this.savedPaymentMethods = currentUser.savedPaymentMethods || [];
    }
  }

  selectSavedAddress(address: ShippingAddress) {
    this.shippingForm.patchValue({
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phoneNumber: address.phoneNumber
    });
    this.nextStep();
  }

  selectPaymentMethod(method: PaymentMethod) {
    this.paymentForm.patchValue({
      cardType: method.type,
      cardHolderName: method.cardHolderName,
      cardNumber: method.cardNumber || '',
      expiryDate: method.expiryDate || '',
      cvv: method.cvv || ''
    });
    this.nextStep();
  }

  calculateTotal(): number {
    return this.cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  completeOrder() {
    if (this.shippingForm.valid && this.paymentForm.valid) {
      const currentUser = this.authService.getCurrentUser();
      const shippingAddress: ShippingAddress = this.shippingForm.value;
      const paymentMethod: PaymentMethod = this.paymentForm.value;

      const order: Order = {
        id: Date.now().toString(),
        userId: currentUser?.id || '',
        items: this.cart.items,
        total: this.calculateTotal(),
        shippingAddress,
        paymentMethod,
        orderDate: new Date(),
        status: 'pending',
        discount: 0
      };

      this.orderService.createOrder(order).subscribe(
        createdOrder => {
          this.presentToast('Orden creada exitosamente', 'success');
          this.cartService.clearCart();
          this.navCtrl.navigateRoot('/tabs/orders');
        },
        error => {
          this.presentToast('Error al crear la orden', 'danger');
        }
      );
    }
  }

  navigateBack() {
    this.navCtrl.back();
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'secondary' = 'secondary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}
