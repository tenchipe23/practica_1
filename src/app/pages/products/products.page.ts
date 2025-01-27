import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { ActionSheetController } from '@ionic/angular';
import { CartService } from '../../services/cart.service';
import { DataService } from '../../services/data.service';
import { Product, Category } from '../../models';
import { ProductService } from '../../services/product.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule
  ]
})
export class ProductsPage implements OnInit {
  Math = Math;
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'todos';   
  
  loading = {
    products: false,
    categories: false
  };
  error: string | null = null;

  categoriesWithProducts: Map<string, Product[]> = new Map();

  isCategoriesMenuOpen = false;

  isCategoriesDropdownOpen = false;

  constructor(
    private productService: ProductService,
    private httpService: HttpService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private cartService: CartService,
    private dataService: DataService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.products = this.dataService.getProducts();
  }

  ngOnInit() {
    // Check for category query parameter
    this.route.queryParams.subscribe(params => {
      const categoryParam = params['category'];
      
      // If category is provided, set it as the selected category
      if (categoryParam) {
        const normalizedCategory = this.normalizeCategory(categoryParam);
        this.selectedCategory = normalizedCategory;
      }

      // Load categories and products
      this.loadCategories().then(() => {
        this.loadProducts();
      });
    });
  }

  async loadCategories(): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cargando categorías...',
      spinner: 'circles'
    });
    await loading.present();

    this.loading.categories = true;
    this.error = null;

    try {
      const categories = await this.httpService.getCategories().toPromise() || [];
      const products = await this.httpService.getProducts().toPromise() || [];

      console.log('Raw Categories from API:', categories);
      console.log('Raw Products from API:', products);

      const categoriesWithProducts = new Map<string, Product[]>();
      
      products.forEach(product => {
        if (!product) return; 
        
        // Log raw category for debugging
        console.log('Raw Product Category:', product.category, 'Type:', typeof product.category);
        
        const categoryName = this.normalizeCategory(product.category);
        
        if (!categoriesWithProducts.has(categoryName)) {
          categoriesWithProducts.set(categoryName, []);
        }
        categoriesWithProducts.get(categoryName)!.push(product);
      });

      const filteredCategories = Array.from(categoriesWithProducts.keys())
        .map(name => ({ 
          name, 
          productCount: categoriesWithProducts.get(name)!.length 
        }))
        .filter((category, index, self) => 
          index === self.findIndex(t => t.name === category.name)
        )
        .sort((a, b) => b.productCount - a.productCount);

      // Ensure each category is a string
      this.categories = [
        { name: 'Todos', productCount: products.length || 0 },
        ...filteredCategories.map(cat => ({
          name: String(cat.name),
          productCount: cat.productCount
        }))
      ];

      console.log('Processed Categories:', this.categories);

      this.categoriesWithProducts = categoriesWithProducts;

      // Validate and set selected category
      const normalizedCategories = this.categories.map(c => this.normalizeCategory(c.name));
      if (!normalizedCategories.includes(this.selectedCategory)) {
        this.selectedCategory = 'todos';
      }

      console.log('Final Selected Category:', this.selectedCategory);
    } catch (error) {
      console.error('Error loading categories:', error);
      
      // Similar logging for local data fallback
      const localCategories = this.dataService.getCategories();
      const localProducts = this.dataService.getProducts();

      console.log('Local Categories:', localCategories);
      console.log('Local Products:', localProducts);

      const categoriesWithProducts = new Map<string, Product[]>();
      
      localProducts.forEach(product => {
        if (!product) return; 
        
        const categoryName = this.normalizeCategory(product.category);
        
        if (!categoriesWithProducts.has(categoryName)) {
          categoriesWithProducts.set(categoryName, []);
        }
        categoriesWithProducts.get(categoryName)!.push(product);
      });

      const filteredCategories = Array.from(categoriesWithProducts.keys())
        .map(name => ({ 
          name, 
          productCount: categoriesWithProducts.get(name)!.length 
        }))
        .filter((category, index, self) => 
          index === self.findIndex(t => t.name === category.name)
        )
        .sort((a, b) => b.productCount - a.productCount);

      // Ensure each category is a string
      this.categories = [
        { name: 'Todos', productCount: localProducts.length || 0 },
        ...filteredCategories.map(cat => ({
          name: String(cat.name),
          productCount: cat.productCount
        }))
      ];

      this.categoriesWithProducts = categoriesWithProducts;

      // Validate and set selected category
      const normalizedCategories = this.categories.map(c => this.normalizeCategory(c.name));
      if (!normalizedCategories.includes(this.selectedCategory)) {
        this.selectedCategory = 'todos';
      }

      this.error = 'No se pudieron cargar las categorías. Se muestran categorías locales.';
    } finally {
      this.loading.categories = false;
      loading.dismiss();
    }
  }

  loadProducts() {
    this.loading.products = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        // Filter products by selected category
        if (this.selectedCategory && this.selectedCategory !== 'todos') {
          this.products = products.filter(product => 
            this.normalizeCategory(product.category) === this.selectedCategory
          );
        } else {
          this.products = products;
        }

        this.loading.products = false;
        
        this.categorizeProducts(products);
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
        this.error = error.message || 'No se pudieron cargar los productos';
        this.loading.products = false;
      }
    });
  }

  private categorizeProducts(products: Product[]) {
    this.categoriesWithProducts.clear();

    products.forEach(product => {
      const category = product.category || 'Sin Categoría';
      
      if (!this.categoriesWithProducts.has(category)) {
        this.categoriesWithProducts.set(category, []);
      }
      
      this.categoriesWithProducts.get(category)?.push(product);
    });
  }

  retryLoading() {
    this.loadProducts();
  }

  toggleCategoriesMenu() {
    this.isCategoriesMenuOpen = !this.isCategoriesMenuOpen;
  }

  toggleCategoriesDropdown() {
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
  }

  onCategorySelect(category: any) {
    // Ensure category is handled correctly
    if (!category) return;

    // If category is an object, use its name
    const categoryName = typeof category === 'object' 
      ? (category.name || 'Todos') 
      : String(category);

    // Normalize the category name
    const normalizedCategory = this.normalizeCategory(categoryName);

    // Update selected category
    this.selectedCategory = normalizedCategory;

    // Filter products based on selected category
    this.loadProducts();
  }

  isCategoryActive(category: any): boolean {
    // Ensure category is handled correctly
    if (!category) return false;

    // If category is an object, use its name
    const categoryName = typeof category === 'object' 
      ? (category.name || 'Todos') 
      : String(category);

    // Normalize and compare
    return this.normalizeCategory(categoryName) === this.selectedCategory;
  }

  getCategoryIcon(categoryName: any): string {
    // Ensure categoryName is a string
    const normalizedCategory = this.normalizeCategory(
      typeof categoryName === 'object' 
        ? (categoryName.name || 'default') 
        : categoryName
    );

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

  private getCategoryName(category: any): string {
    if (category === null || category === undefined) {
      return 'Sin Categoría';
    }

    if (typeof category === 'string') {
      return category;
    }

    if (typeof category === 'object') {
      if (category.hasOwnProperty('name')) {
        return String(category.name);
      }
      
      return String(category);
    }

    return String(category);
  }

  private normalizeCategory(category: any): string {
    // Detailed logging for category normalization
    console.log('Normalizing Category:', category, 'Type:', typeof category);

    // Handle null or undefined
    if (category == null) {
      console.log('Returning default category');
      return 'sin categoría';
    }

    // If it's an object, try to extract name
    if (typeof category === 'object') {
      console.log('Category is an object, attempting to extract name');
      category = category.name || category.toString();
    }

    // Convert to string, trim, and lowercase
    const categoryStr = String(category).trim().toLowerCase();
    
    console.log('Normalized Category:', categoryStr);
    return categoryStr || 'sin categoría';
  }

  navigateToProductDetail(productId: number) {
    console.log('Navigating to product detail from products page with ID:', productId);
    if (!productId || isNaN(productId)) {
      console.error('Invalid product ID:', productId);
      return;
    }
    this.navCtrl.navigateForward(`/product-detail/${productId}`);
  }

  navigateBack() {
    this.navCtrl.back();
  }

  async openCategoriesFilter() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtrar Categorías',
      buttons: [
        {
          text: 'Todos',
          handler: () => {
            this.selectedCategory = 'todos';
          }
        },
        ...Array.from(this.categoriesWithProducts.keys())
          .filter(category => category !== 'todos')
          .map(category => ({
            text: category,
            handler: () => {
              this.selectedCategory = category;
            }
          })),
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    
    await actionSheet.present();
  }

  viewProductDetails(product: Product) {
    this.navCtrl.navigateForward(`/product-details/${product.id}`);
  }

  handleImageError(event: any) {
    event.target.src = 'assets/placeholder-image.png';
  }

  calculateOriginalPrice(product: Product): number {
    return product.originalPrice || product.price;
  }

  getStarRating(rating: number = 0): { type: string, class: string }[] {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    const stars: { type: string, class: string }[] = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push({ type: 'star', class: 'star-full' });
    }

    if (halfStar) {
      stars.push({ type: 'star-half', class: 'star-half' });
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push({ type: 'star-outline', class: 'star-empty' });
    }

    return stars;
  }

  resetCategory() {
    this.selectedCategory = 'todos';
  }

  addToCart(product: Product, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    console.group(' Add to Cart Process');
    console.log('Attempting to add product:', {
      productId: product?.id,
      productName: product?.name,
      inStock: product?.inStock,
      stock: product?.stock
    });

    if (!this.canAddToCart(product)) {
      if (!product) {
        console.error(' Cannot add undefined product');
        this.presentCartErrorToast('Producto no válido');
      } else if (product.inStock === false) {
        console.warn(` Product ${product.name} is not in stock`);
        this.presentCartErrorToast(`${product.name} no está disponible`);
      } else if (product.stock <= 0) {
        console.warn(` Product ${product.name} is out of stock`);
        this.presentCartErrorToast(`${product.name} está agotado`);
      } else {
        console.warn(' Unknown error adding product to cart');
        this.presentCartErrorToast('No se puede añadir al carrito');
      }
      console.groupEnd();
      return;
    }

    try {
      this.cartService.addToCart(product, 1);
      
      console.log(`Successfully added ${product.name} to cart`);
      console.log(`Cart now has ${this.cartService.getUniqueProductCount()} unique products`);
      console.log(`Total cart quantity: ${this.cartService.getTotalProductQuantity()}`);
      
      console.groupEnd();
    } catch (error) {
      console.error(' Error adding product to cart:', error);
      this.presentCartErrorToast('Error al añadir producto al carrito');
      console.groupEnd();
    }
  }

  canAddToCart(product: Product): boolean {
    if (!product) {
      console.warn(' Attempted to add undefined product to cart');
      return false;
    }

    console.log('Checking if product can be added to cart:', {
      productId: product.id,
      productName: product.name,
      inStock: product.inStock,
      stock: product.stock
    });

    if (product.inStock === false) {
      console.warn(`⚠️ Product ${product.name} is not in stock`);
      return false;
    }

    if (product.stock <= 0) {
      console.warn(` Product ${product.name} has zero or negative stock`);
      return false;
    }

    if (product.price <= 0) {
      console.warn(`Cannot add product ${product.name} with zero or negative price`);
      return false;
    }

    console.log(`Product ${product.name} can be added to cart`);
    return true;
  }

  private async presentCartErrorToast(message: string) {
    try {
      const toast = await this.toastController.create({
        message: message,
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      toast.present();
      console.log('Cart error toast presented:', message);
    } catch (error) {
      console.error('Error presenting cart error toast:', error);
    }
  }

  truncateProductName(name: string, maxLength: number = 20): string {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  }
}