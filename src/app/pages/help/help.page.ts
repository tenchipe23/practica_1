import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
  standalone: false
})
export class HelpPage implements OnInit {
  helpTopics = [
    {
      title: 'Navegación',
      description: 'Cómo moverte por la aplicación',
      icon: 'navigate-outline',
      details: 'Usa el menú lateral para acceder a configuraciones y perfil. El menú inferior te permite navegar entre las secciones principales.'
    },
    {
      title: 'Compras',
      description: 'Cómo realizar compras y seguir pedidos',
      icon: 'cart-outline',
      details: 'Explora productos, agrega al carrito, y completa tu compra. Puedes ver el estado de tus pedidos en la sección de Pedidos.'
    },
    {
      title: 'Cuenta',
      description: 'Gestión de tu perfil y configuración',
      icon: 'person-outline',
      details: 'Actualiza tu información personal, cambia contraseña y configura preferencias en la sección de Perfil y Configuración.'
    }
  ];

  constructor(private alertController: AlertController) { }

  ngOnInit() {}

  async showHelpDetails(topic: any) {
    const alert = await this.alertController.create({
      header: topic.title,
      message: topic.details,
      buttons: ['Entendido']
    });

    await alert.present();
  }
}