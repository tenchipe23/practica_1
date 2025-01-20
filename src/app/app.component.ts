import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { MenuService } from './services/menu.service'; // Importa MenuService

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html', 
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    public menuService: MenuService 
  ) {
    console.log('AppComponent constructor called');
  }

  ngOnInit() {
    console.log('AppComponent ngOnInit called');
    const user = this.authService.getCurrentUser();
    
    console.log('Current user:', user);
    
    if (user) {
      console.log('Navigating to home');
      this.router.navigate(['/home']);
    } else {
      console.log('Navigating to login');
      this.router.navigate(['/login']);
    }
  }
}