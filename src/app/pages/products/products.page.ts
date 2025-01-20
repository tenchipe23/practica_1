import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { Product, Category } from '../../models';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule
  ]
})
export class ProductsPage implements OnInit {
  Math = Math;
  product: Product = {} as Product; 
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string | null = null;   
  priceRange: { lower: number, upper: number } = { lower: 0, upper: 1000 };
  constructor(
    private dataService: DataService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit() {
    // Load all products
    this.products = this.dataService.getProducts();
    this.filteredProducts = [...this.products];

    // Load categories
    this.categories = this.dataService.getCategories();

    // Check for category filter from navigation
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.filterProducts();
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const categoryMatch = !this.selectedCategory || product.category === this.selectedCategory;
      const priceMatch = product.price >= this.priceRange.lower && 
                         product.price <= this.priceRange.upper;
      const originalPrice = product.originalPrice;
      const discount = originalPrice ? (1 - product.price / originalPrice) * 100 : 0;
      return categoryMatch && priceMatch;
    });
  }

  onCategorySelect(category: string) {
    this.selectedCategory = this.selectedCategory === category ? null : category;
    this.filterProducts();
  }

  onPriceRangeChange() {
    this.filterProducts();
  }

  navigateToProductDetail(productId: number) {
    this.navCtrl.navigateForward(`/products/${productId}`);
  }

  navigateBack() {
    this.navCtrl.back();
  }

  openFilterModal() {
    // Lógica para abrir el modal de filtros
    
  }

  addToCart(product: Product, event: Event): void {
    // Detiene la propagación del evento para evitar que se abra la página de detalles
    event.stopPropagation();

    // Añade el producto al carrito con cantidad 1 por defecto
    this.cartService.addToCart(product, 1);
  }
}