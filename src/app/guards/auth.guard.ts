import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

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
    const isAuthenticated = this.authService.isAuthenticated();
    
    console.log('AuthGuard: Checking authentication', {
      isAuthenticated,
      requestedUrl: state.url
    });

    if (!isAuthenticated) {
      this.router.navigate(['/login'], {
        queryParams: { 
          returnUrl: state.url 
        }
      });
      return of(false);
    }
    
    return of(true);
  }
}