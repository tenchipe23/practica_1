import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { MenuService } from './services/menu.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html', 
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit {
  private currentRoute: string = '';
  showMenus: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public menuService: MenuService 
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      
      this.showMenus = !this.isMenuHidden();

      this.performAuthCheck();
    });
  }

  ngOnInit() {
    this.performAuthCheck();
  }

  private performAuthCheck() {
    const user = this.authService.getCurrentUser();
    const isLoginOrRegisterRoute = this.isMenuHidden();

    if (user) {
      if (isLoginOrRegisterRoute) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    } else {
      if (!isLoginOrRegisterRoute) {
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }
  }

  isMenuHidden(): boolean {
    const hiddenRoutes = ['/login', '/register'];
    return hiddenRoutes.some(route => this.currentRoute.startsWith(route));
  }
}