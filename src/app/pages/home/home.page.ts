import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Product, Category } from '../../models';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpService } from '../../services/http.service';
import { catchError, of, map, switchMap } from 'rxjs';

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
  loading = false;
  error: string | null = null;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private navCtrl: NavController,
    private httpService: HttpService
  ) {}

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadPromotionalProducts();
    this.loadCategoriesWithProducts();

    const currentUser = this.authService.getCurrentUser();
    this.userName = currentUser ? currentUser.name : 'Usuario';
  }

  loadFeaturedProducts() {
    this.loading = true;
    this.httpService.getProducts().pipe(
      catchError(error => {
        console.error('Error loading featured products', error);
        this.error = 'No se pudieron cargar los productos destacados';
        return of([]);
      })
    ).subscribe(products => {
      this.featuredProducts = products.slice(0, 3);
      this.loading = false;
    });
  }

  loadPromotionalProducts() {
    this.loading = true;
    this.httpService.getProducts().pipe(
      catchError(error => {
        console.error('Error loading promotional products', error);
        this.error = 'No se pudieron cargar los productos promocionales';
        return of([]);
      })
    ).subscribe(products => {
      this.promotionalProducts = products.filter(p => p.originalPrice);
      this.loading = false;
    });
  }

  loadCategoriesWithProducts() {
    this.loading = true;
    
    // Combine HTTP and local data sources
    this.httpService.getProducts().pipe(
      catchError(error => {
        console.error('Error loading products', error);
        // Fallback to local products if HTTP fails
        return of(this.dataService.getProducts());
      }),
      map(products => {
        // Create a map to track categories with their products
        const categoriesWithProducts = new Map<string, Product[]>();
        
        products.forEach(product => {
          // Safely extract and normalize category
          const category = this.extractCategory(product);
          
          if (!category) return;
          
          if (!categoriesWithProducts.has(category)) {
            categoriesWithProducts.set(category, []);
          }
          categoriesWithProducts.get(category)!.push(product);
        });
        
        // Convert map to array of categories with product count
        const filteredCategories = Array.from(categoriesWithProducts.keys())
          .map(name => ({ 
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name, 
            icon: this.getCategoryIcon(name),
            productCount: categoriesWithProducts.get(name)!.length 
          }))
          .filter(category => category.productCount > 0)
          .sort((a, b) => b.productCount - a.productCount);
        
        console.log('Loaded categories:', filteredCategories);
        
        return filteredCategories;
      }),
      catchError(error => {
        console.error('Error processing categories', error);
        this.error = 'No se pudieron cargar las categorías';
        return of([]);
      })
    ).subscribe(categories => {
      this.recommendedCategories = categories;
      this.loading = false;
    });
  }

  navigateToProductList(category?: string) {
    if (category) {
      // Normalize the category name before navigation
      const normalizedCategory = this.normalizeCategory(category);
      
      this.navCtrl.navigateForward('/products', {
        queryParams: { 
          category: normalizedCategory 
        }
      });
    } else {
      // If no category is specified, navigate to products page
      this.navCtrl.navigateForward('/products');
    }
  }

  navigateToProductDetail(productId: number) {
    console.log('Navigating to product detail with ID:', productId);
    if (!productId || isNaN(productId)) {
      console.error('Invalid product ID:', productId);
      return;
    }
    this.navCtrl.navigateForward(`/product-detail/${productId}`);
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

  private extractCategory(product: any): string | null {
    // Safely extract category, handling various potential input types
    if (!product) return null;

    // If category is already a string, normalize it
    if (typeof product.category === 'string') {
      return this.normalizeCategory(product.category);
    }

    // If category is an object with a name property
    if (product.category && typeof product.category === 'object') {
      return this.normalizeCategory(product.category.name);
    }

    // If category is a number or some other type, convert to string
    if (product.category != null) {
      return this.normalizeCategory(String(product.category));
    }

    return null;
  }

  private normalizeCategory(category: any): string {
    // Ensure category is a string before trimming
    if (category == null) return 'sin categoría';

    // Convert to string and trim
    const categoryStr = String(category).trim().toLowerCase();
    
    return categoryStr || 'sin categoría';
  }

  private getCategoryIcon(categoryName: string): string {
    const normalizedCategory = this.normalizeCategory(categoryName);
    
    const categoryIcons: { [key: string]: string } = {
      'electronics': 'laptop',
      'computers': 'desktop',
      'audio': 'headset',
      'smartphones': 'phone-portrait',
      'accessories': 'grid',
      'gaming': 'game-controller',
      'default': 'grid'
    };

    return categoryIcons[normalizedCategory] || categoryIcons['default'];
  }
}
