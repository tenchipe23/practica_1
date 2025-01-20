import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    console.log('AuthGuard: Checking authentication');
    
    return this.authService.currentUser$.pipe(
      take(1), // Toma solo el primer valor
      map(user => {
        const isAuthenticated = !!user;
        
        console.log('Is authenticated:', isAuthenticated);
        
        if (!isAuthenticated) {
          console.log('Redirecting to login');
          // Guarda la URL a la que intentaba acceder
          this.router.navigate(['/login'], {
            queryParams: { 
              returnUrl: state.url 
            }
          });
          return false;
        }
        
        return true;
      })
    );
  }
}