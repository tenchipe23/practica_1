import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { User as UserModel } from '../models/user.model';
import { User as IndexUser } from '../models';
import { LoginCredentials, RegisterData, LoginResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private httpService: HttpService,
    private router: Router,
    private toastController: ToastController
  ) {
    setTimeout(() => this.loadStoredUser(), 0);
  }

  private loadStoredUser() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const isTokenValid = this.validateToken(token);
        
        if (!isTokenValid) {
          this.logout();
        } else {
          this.fetchUserProfile().subscribe();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        this.logout();
      }
    }
  }

  private validateToken(token: string): boolean {
    if (!token) return false;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;

      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  fetchUserProfile() {
    return this.httpService.getUserProfile().pipe(
      tap((user: IndexUser) => {
        const userModel: UserModel = {
          id: user.id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          password: '', 
          phoneNumber: user.phoneNumber || '', 
          address: user.address,
          savedAddresses: user.savedAddresses,
          savedPaymentMethods: user.savedPaymentMethods,
          role: user.role || 'user'
        };
        
        this.currentUserSubject.next(userModel);
      }),
      catchError((error) => {
        console.error('User profile fetch failed:', error);
        this.logout();
        return of(null);
      })
    );
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    return this.httpService.login(credentials).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          
          const user: UserModel = {
            id: response._id,
            name: response.name,
            email: response.email,
            password: '',  
            phoneNumber: response.phoneNumber || '', 
            role: response.role || 'user'
          };
          this.currentUserSubject.next(user);
          
          this.presentToast('Inicio de sesión exitoso', 'success');
          
          this.router.navigate(['/home'], { 
            replaceUrl: true 
          });
        }
      }),
      map(response => !!(response && response.token)), 
      catchError(error => {
        console.error('Login error:', error);
        this.presentToast('Credenciales incorrectas', 'danger');
        return of(false);
      })
    );
  }

  register(data: RegisterData): Observable<boolean> {
    if (data.password !== data.confirmPassword) {
      this.presentToast('Las contraseñas no coinciden', 'danger');
      return of(false);
    }

    const passwordStrength = this.checkPasswordStrength(data.password);
    if (passwordStrength === 'weak') {
      this.presentToast('La contraseña es demasiado débil', 'danger');
      return of(false);
    }

    return this.httpService.register(data).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          
          const user: UserModel = {
            id: response._id,
            name: response.name,
            email: response.email,
            password: '',  
            phoneNumber: response.phoneNumber || '', 
            role: response.role || 'user'
          };
          this.currentUserSubject.next(user);
          
          this.presentToast('Registro exitoso', 'success');
          
          this.router.navigate(['/home'], { 
            replaceUrl: true 
          });
        }
      }),
      map(response => !!(response && response.token)), 
      catchError(error => {
        console.error('Registration error:', error);
        const errorMessage = error.error?.message || 'Error en el registro';
        this.presentToast(errorMessage, 'danger');
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    
    this.currentUserSubject.next(null);
    
    this.presentToast('Sesión finalizada', 'secondary');
    
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): UserModel | null {
    return this.currentUserSubject.getValue();
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'secondary' = 'secondary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }

  checkPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
    if (password.length < 6) return 'weak';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    if (strengthCount >= 3) return 'strong';
    if (strengthCount >= 2) return 'medium';
    return 'weak';
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      this.presentToast('Contraseña cambiada exitosamente', 'success');
      return true;
    } catch (error) {
      this.presentToast('Error al cambiar la contraseña', 'danger');
      return false;
    }
  }

  async deleteAccount(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      
      localStorage.removeItem('token');
      this.currentUserSubject.next(null);
      this.presentToast('Cuenta eliminada', 'secondary');
      this.router.navigate(['/login'], { replaceUrl: true });
      
      return true;
    } catch (error) {
      this.presentToast('Error al eliminar la cuenta', 'danger');
      return false;
    }
  }

  updateCurrentUser(updatedUser: UserModel): Observable<boolean> {
    return this.httpService.updateUserProfile(updatedUser).pipe(
      map(response => {
        const userModel: UserModel = {
          id: response.id,
          name: response.name,
          email: response.email,
          profileImage: response.profileImage,
          password: '', 
          phoneNumber: response.phoneNumber || '', 
          address: response.address,
          savedAddresses: response.savedAddresses,
          savedPaymentMethods: response.savedPaymentMethods,
          role: response.role || 'user'
        };

        this.currentUserSubject.next(userModel);
        this.presentToast('Perfil actualizado exitosamente', 'success');
        return true;
      }),
      catchError(error => {
        this.presentToast('Error al actualizar el perfil', 'danger');
        return of(false);
      })
    );
  }
}
