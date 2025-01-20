import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.page.html',
  styleUrls: ['./promotions.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PromotionsPage implements OnInit {
  promotions: any[] = [];
  featuredPromotions: any[] = [];

  constructor(
    private dataService: DataService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.promotions = this.dataService.getPromotions();
  }

  loadPromotions() {
    // Get promotions from data service
    this.promotions = this.dataService.getPromotions();
    
    // Filter featured promotions
    this.featuredPromotions = this.promotions.filter(promo => promo.featured);
  }

  navigateToProductDetails(productId: string) {
    this.navCtrl.navigateForward(`/products/${productId}`);
  }

  applyPromotion(promotion: any) {
    // Logic to apply promotion to cart or product
    console.log('Applying promotion:', promotion);
  }

  navigateBack() {
    this.navCtrl.back();
  }
}
