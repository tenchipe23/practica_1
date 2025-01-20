import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models';

// Define un tipo extendido para manejar la cantidad
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
  
  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private navCtrl: NavController,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Obtiene el ID del producto de la URL
    this.route.paramMap.subscribe(params => {
      const productId = Number(params.get('id'));
      
      // Busca el producto por ID
      this.product = this.dataService.getProductById(productId);
    });
  }

  incrementQuantity() {
    if (!this.product) return;
    
    // Incrementa la cantidad, limitada por el stock
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    // Decrementa la cantidad, mínimo 1
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) return;

    // Crea un objeto de producto con cantidad
    const productToAdd: ProductWithQuantity = {
      ...this.product,
      quantity: this.quantity
    };

    // Añade el producto al carrito
    this.cartService.addToCart(productToAdd);

    // TODO: Implementar toast de confirmación
    console.log('Producto añadido al carrito:', productToAdd);
  }

  navigateBack() {
    this.navCtrl.back();
  }

  calculateDiscount(): number {
    if (!this.product || !this.product.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }
}