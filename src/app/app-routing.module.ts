import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then(m => m.CartPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.page').then(m => m.CheckoutPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'promotions',
    loadComponent: () => import('./pages/promotions/promotions.page').then(m => m.PromotionsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then(m => m.OrdersPage),
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    loadComponent: () => import('./pages/settings/settings.page').then(m => m.SettingsPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.page').then(m => m.ProductDetailPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'help',
    loadChildren: () => import('./pages/help/help.module').then( m => m.HelpPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then( m => m.ContactPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-purchases',
    loadChildren: () => import('./pages/my-purchases/my-purchases.module').then( m => m.MyPurchasesPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  },
  
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { 
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload' 
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }