import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface Purchase {
  id: string;
  date: Date;
  total: number;
  items: Array<{name: string, quantity: number, price: number}>;
  status: 'Completado' | 'En proceso' | 'Cancelado';
}

@Component({
  selector: 'app-my-purchases',
  templateUrl: './my-purchases.page.html',
  styleUrls: ['./my-purchases.page.scss'],
  standalone: false
})
export class MyPurchasesPage implements OnInit {
  purchases: Purchase[] = [
    {
      id: 'P001',
      date: new Date('2024-01-15'),
      total: 150.50,
      items: [
        {name: 'Producto A', quantity: 2, price: 50.25},
        {name: 'Producto B', quantity: 1, price: 50.00}
      ],
      status: 'Completado'
    },
    {
      id: 'P002',
      date: new Date('2024-02-01'),
      total: 75.25,
      items: [
        {name: 'Producto C', quantity: 1, price: 75.25}
      ],
      status: 'En proceso'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  getStatusColor(status: string) {
    switch(status) {
      case 'Completado': return 'success';
      case 'En proceso': return 'warning';
      case 'Cancelado': return 'danger';
      default: return 'medium';
    }
  }
}