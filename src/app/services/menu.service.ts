import { Injectable } from '@angular/core';
import { NavController } from '@ionic/angular';

export interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  // Menú lateral (secundario)
  sideMenuItems: MenuItem[] = [
    { title: 'Perfil', icon: 'person-outline', route: '/profile' },
    { title: 'Configuración', icon: 'settings-outline', route: '/settings' },
    { title: 'Ayuda', icon: 'help-circle-outline', route: '/help' },
    { title: 'Contacto', icon: 'mail-outline', route: '/contact' }
  ];

  // Menú inferior (principal)
  bottomMenuItems: MenuItem[] = [
    { title: 'Inicio', icon: 'home-outline', route: '/home' },
    { title: 'Productos', icon: 'grid-outline', route: '/products' },
    { title: 'Pedidos', icon: 'cart-outline', route: '/orders' },
    { title: 'Compras', icon: 'receipt-outline', route: '/my-purchases' }
  ];

  constructor(private navCtrl: NavController) {}

  navigateTo(route: string) {
    this.navCtrl.navigateRoot(route);
  }
}