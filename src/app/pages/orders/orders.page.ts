import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NavController, AlertController, ActionSheetController } from '@ionic/angular';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule,
    CurrencyPipe,
    DatePipe
  ]
})
export class OrdersPage implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'all';

  constructor(
    private orderService: OrderService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe(orders => {
      this.orders = orders.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      this.filterOrders();
    });
  }

  filterOrders() {
    this.filteredOrders = this.selectedFilter === 'all' 
      ? this.orders 
      : this.orders.filter(order => order.status === this.selectedFilter);
  }

  async openFilterOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filtrar Pedidos',
      buttons: [
        {
          text: 'Todos los Pedidos',
          handler: () => {
            this.selectedFilter = 'all';
            this.filterOrders();
          }
        },
        {
          text: 'Pendientes',
          handler: () => {
            this.selectedFilter = 'pending';
            this.filterOrders();
          }
        },
        {
          text: 'En Proceso',
          handler: () => {
            this.selectedFilter = 'processing';
            this.filterOrders();
          }
        },
        {
          text: 'Enviados',
          handler: () => {
            this.selectedFilter = 'shipped';
            this.filterOrders();
          }
        },
        {
          text: 'Entregados',
          handler: () => {
            this.selectedFilter = 'delivered';
            this.filterOrders();
          }
        },
        {
          text: 'Cancelados',
          handler: () => {
            this.selectedFilter = 'cancelled';
            this.filterOrders();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async viewOrderDetails(order: Order) {
    const alert = await this.alertController.create({
      header: `Detalles del Pedido ${order.id}`,
      message: this.formatOrderDetails(order),
      buttons: [
        {
          text: 'Rastrear Pedido',
          handler: () => this.trackOrder(order)
        },
        {
          text: 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  private formatOrderDetails(order: Order): string {
    return `
      <strong>Fecha:</strong> ${new Date(order.orderDate).toLocaleDateString()}<br>
      <strong>Estado:</strong> ${this.getStatusLabel(order.status)}<br>
      <strong>Total:</strong> ${order.total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}<br>
      <strong>Dirección de Envío:</strong><br>
      ${order.shippingAddress.fullName}<br>
      ${order.shippingAddress.streetAddress}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
    `;
  }

  private getStatusLabel(status: Order['status']): string {
    type OrderStatus = Order['status'];
    const statusLabels: { [key in OrderStatus]: string } = {
      'pending': 'Pendiente',
      'processing': 'En Proceso',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusLabels[status];
  }

  private async trackOrder(order: Order) {
    const alert = await this.alertController.create({
      header: 'Rastreo de Pedido',
      message: 'Esta función estará disponible próximamente.',
      buttons: ['OK']
    });
    await alert.present();
  }

  navigateBack() {
    this.navCtrl.back();
  }

  navigateToHome() {
    this.navCtrl.navigateRoot('/home');
  }
}
