import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';




@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonicModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomePage implements OnInit {
  featuredProducts: Product[] = [];
  recommendedCategories: Category[] = [];
  promotionalProducts: Product[] = [];
  userName: string = 'Usuario';

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    
    // Load featured products
    this.featuredProducts = this.dataService.getProducts().slice(0, 3);
    
    // Load recommended categories
    this.recommendedCategories = this.dataService.getCategories();
    
    // Load promotional products
    this.promotionalProducts = this.dataService.getProducts()
      .filter(product => product.originalPrice !== undefined)
      .slice(0, 4);

    // Get current user's name
    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser ? currentUser.name : 'Usuario';
  }

  navigateToProductList(category?: string) {
    if (category) {
      this.navCtrl.navigateForward('/products', { 
        queryParams: { category: category } 
      });
    } else {
      this.navCtrl.navigateForward('/products');
    }
  }

  navigateToProductDetail(productId: number) {
    this.navCtrl.navigateForward(`/products/${productId}`);
  }

  navigateToCart() {
    this.navCtrl.navigateForward('/cart');
  }

  navigateToProfile() {
    this.navCtrl.navigateForward('/profile');
  }

  navigateToPromotions() {
    this.navCtrl.navigateForward('/promotions');
  }
}
