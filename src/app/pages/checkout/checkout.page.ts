 import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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
      fullName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      streetAddress: ['', [
        Validators.required, 
        Validators.minLength(5), 
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-Z0-9\s,.-]+$/)
      ]],
      city: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      state: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      postalCode: ['', [
        Validators.required, 
        Validators.minLength(4), 
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/)
      ]],
      country: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern(/^(\+?[0-9]{10,14})$/)
      ]]
    });

    this.paymentForm = this.fb.group({
      cardType: ['', Validators.required],
      cardNumber: ['', [
        Validators.required, 
        this.validateCreditCardNumber
      ]],
      cardHolderName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      expiryDate: ['', [
        Validators.required, 
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
        this.validateExpiryDate
      ]],
      cvv: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(4),
        Validators.pattern(/^[0-9]{3,4}$/)
      ]]
    });
  }

  ngOnInit() {
    this.cartService.getCurrentCart().subscribe(cart => {
      this.cart = cart;
    });
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.savedAddresses = (currentUser.savedAddresses || []).map(address => ({
        id: address.id || '',
        fullName: address.fullName || '',
        streetAddress: address.streetAddress || '',
        city: address.city || '',
        state: address.state || '',
        postalCode: address.postalCode || '',
        country: address.country || '',
        phoneNumber: address.phoneNumber || ''
      }));
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
    if (this.currentStep === 1) {
      this.markFormGroupTouched(this.shippingForm);
      if (this.shippingForm.valid) {
        this.currentStep++;
      } else {
        this.presentToast('Por favor, complete correctamente el formulario de envío', 'danger');
      }
    } else if (this.currentStep === 2) {
      this.markFormGroupTouched(this.paymentForm);
      if (this.paymentForm.valid) {
        this.currentStep++;
      } else {
        this.presentToast('Por favor, complete correctamente el formulario de pago', 'danger');
      }
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

  private static detectCardType(cardNumber: string): string | null {
    const cleanedNumber = cardNumber.replace(/[\s-]/g, '');

    const cardPatterns = [
      {
        type: 'visa',
        patterns: [/^4/],
        lengths: [13, 16, 19],
        description: 'Starts with 4, 13-19 digits'
      },
      {
        type: 'mastercard',
        patterns: [/^5[1-5]/, /^2[2-7]/],
        lengths: [16],
        description: 'Starts with 51-55 or 22-27, 16 digits'
      },
      {
        type: 'amex',
        patterns: [/^3[47]/],
        lengths: [15],
        description: 'Starts with 34 or 37, 15 digits'
      },
      {
        type: 'discover',
        patterns: [/^6011/, /^65/, /^644/, /^645/, /^646/, /^647/, /^648/, /^649/, /^6/],
        lengths: [16, 19],
        description: 'Starts with 6011, 65, 644-649, or 6, 16-19 digits'
      }
    ];

    const matchedCard = cardPatterns.find(card => 
      card.patterns.some(pattern => pattern.test(cleanedNumber)) &&
      card.lengths.includes(cleanedNumber.length)
    );

    return matchedCard ? matchedCard.type : null;
  }

  private static validateLuhn(cleanedValue: string): boolean {
    const digits = cleanedValue.split('').map(Number);
    let sum = 0;
    let isEvenIndex = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEvenIndex) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEvenIndex = !isEvenIndex;
    }

    return sum % 10 === 0;
  }

  validateCreditCardNumber(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const cleanedValue = value.replace(/[\s-]/g, '');

    console.group('Credit Card Validation');
    console.log('Original Input:', value);
    console.log('Cleaned Number:', cleanedValue);

    const cardType = CheckoutPage.detectCardType(value);
    console.log('Detected Card Type:', cardType);

    if (!cardType) {
      console.log(' No valid card type found');
      console.groupEnd();
      return {'invalidCardFormat': true};
    }

    const isLuhnValid = CheckoutPage.validateLuhn(cleanedValue);
    
    console.log('Luhn Algorithm:', {
      sum: 0, 
      isValid: isLuhnValid
    });
    console.groupEnd();

    return isLuhnValid ? null : {'invalidCreditCard': true};
  }

  getCreditCardIcon(cardNumber: string): string {
    if (!cardNumber) return 'card-outline';

    const cardType = CheckoutPage.detectCardType(cardNumber);
    
    switch (cardType) {
      case 'visa': return 'logo-visa';
      case 'mastercard': return 'logo-mastercard';
      case 'amex': return 'logo-amex';
      case 'discover': return 'card-outline';
      default: return 'card-outline';
    }
  }

  debugCardValidation(cardNumber: string) {
    console.log('Card Validation Debug');
    console.log('Original Number:', cardNumber);

    const cleanedNumber = cardNumber.replace(/\D/g, '');
    console.log('Cleaned Number:', cleanedNumber);

    const cardType = CheckoutPage.detectCardType(cardNumber);
    console.log('Detected Card Type:', cardType);

    const cardPatterns = [
      {
        type: 'Visa',
        pattern: /^4/,
        description: 'Starts with 4, 13-19 digits',
        examples: ['4111111111111111', '4222222222222']
      },
      {
        type: 'Mastercard',
        pattern: /^5[1-5]|^2[2-7]/,
        description: 'Starts with 51-55 or 22-27, 16 digits',
        examples: ['5500000000000004', '5555555555554444', '2222444455556666']
      },
      {
        type: 'American Express',
        pattern: /^3[47]/,
        description: 'Starts with 34 or 37, 15 digits',
        examples: ['340000000000009', '370000000000002']
      },
      {
        type: 'Discover',
        pattern: /^6(?:011|5|44[4-9])/,
        description: 'Starts with 6011, 65, 644-649, 16 digits',
        examples: ['6011111111111117', '6522222222222222']
      }
    ];

    const isLuhnValid = CheckoutPage.validateLuhn(cleanedNumber);
    console.log('Luhn Algorithm:', {
      sum: 0,
      isValid: isLuhnValid
    });
  }

  formatCreditCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    let formatted = '';

    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }

    event.target.value = formatted;
    this.paymentForm.get('cardNumber')?.setValue(formatted, { emitEvent: false });

    this.debugCardValidation(formatted);
  }

  validateExpiryDate(control: AbstractControl): {[key: string]: any} | null {
    const value = control.value;
    if (!value) return null;

    const [monthStr, yearStr] = value.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(month) || isNaN(year)) {
      return {'invalidFormat': true};
    }

    const expiryDate = new Date(2000 + year, month - 1);
    const currentDate = new Date();

    return expiryDate > currentDate ? null : {'expiredCard': true};
  }

  logCardValidationDetails(cardNumber: string) {
    const cleanedNumber = cardNumber.replace(/[\s-]/g, '');

    const cardPatterns: {[key in keyof typeof this.cardExamples]: RegExp} = {
      visa: /^4\d{12,18}$/,
      mastercard: /^5[1-5]\d{14}$/,
      amex: /^3[47]\d{13}$/,
      discover: /^6(?:011\d{12}|5\d{14})$/
    };

    const validationResults = (Object.keys(cardPatterns) as Array<keyof typeof cardPatterns>).map(cardType => ({
      cardType,
      matches: cardPatterns[cardType].test(cleanedNumber),
      example: `Example ${cardType}: ${this.getCardTypeExample(cardType)}`
    }));

    console.log('Card Validation Details:', {
      originalNumber: cardNumber,
      cleanedNumber: cleanedNumber,
      validationResults: validationResults
    });
  }

  private getCardTypeExample(cardType: keyof typeof this.cardExamples): string {
    return this.cardExamples[cardType];
  }

  private readonly cardExamples = {
    visa: '4111 1111 1111 1111',
    mastercard: '5500 0000 0000 0004',
    amex: '3400 0000 0000 009',
    discover: '6011 1111 1111 1117'
  };

  getErrorMessage(form: FormGroup, controlName: string): string {
    const control = form.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'Este campo es obligatorio';
      if (control.errors['minlength']) return 'El campo es demasiado corto';
      if (control.errors['maxlength']) return 'El campo es demasiado largo';
      if (control.errors['pattern']) return 'Formato inválido';
      if (control.errors['invalidCreditCard']) return 'Número de tarjeta inválido';
      if (control.errors['invalidCardFormat']) return 'Formato de tarjeta no reconocido';
      if (control.errors['expiredCard']) return 'Tarjeta expirada';
      if (control.errors['invalidFormat']) return 'Formato de fecha inválido';
    }
    return '';
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
