import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ProductWithQuantity extends Product {
  quantity: number;
}

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule
  ]
})
export class ProductDetailPage implements OnInit {
  product: Product | null = null;
  quantity: number = 1;
  loading: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private navCtrl: NavController,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const productIdParam = params.get('id');
      console.log('Raw Product ID from Route:', productIdParam);
      
      params.keys.forEach(key => {
        console.log(`Route Param ${key}:`, params.get(key));
      });
      
      const productId = Number(productIdParam);
      
      console.log('Parsed Product ID:', productId);
      
      if (isNaN(productId) || productId <= 0) {
        console.error('Invalid product ID:', productIdParam);
        this.error = 'ID de producto inválido';
        this.loading = false;
        
        this.navCtrl.navigateBack('/products');
        return;
      }
  
      this.loadProductDetails(productId);
    });
  }
  
  loadProductDetails(productId: number) {
    this.loading = true;
    this.error = null;
    
    console.log('Loading product details for ID:', productId);
  
    this.httpService.getProductById(productId).pipe(
      catchError(error => {
        console.error('Error loading product details', error);
        this.error = 'No se pudo cargar el producto';
        this.loading = false;
        return of(null);
      })
    ).subscribe(product => {
      console.log('Fetched Product:', product);
      
      this.product = product ?? null;
      this.loading = false;
  
      if (!this.product) {
        this.error = 'Producto no encontrado';
        console.warn(`No product found for ID: ${productId}`);
      }
    });
  }

  incrementQuantity() {
    if (!this.product) return;
    
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      const productToAdd: ProductWithQuantity = {
        ...this.product,
        quantity: this.quantity
      };
      this.cartService.addToCart(productToAdd);
      this.navCtrl.navigateForward('/cart');
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  calculateDiscount(): number {
    if (!this.product || !this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }
}