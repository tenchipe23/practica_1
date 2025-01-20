import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../models';
import { DataService } from './data.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private dataService: DataService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    console.log('Attempting login with:', credentials);
    
    const users = this.dataService.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (user && user.password === credentials.password) {
      console.log('Login successful for user:', user);
      
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      this.presentToast('Inicio de sesión exitoso', 'success');
      
      return of(true);
    } else {
      console.log('Login failed');
      this.presentToast('Credenciales incorrectas', 'danger');
      return of(false);
    }
  }

  // Método para obtener el estado de autenticación actual
  isAuthenticated(): boolean {
    return this.currentUserSubject.getValue() !== null;
  }

  logout() {
    // Clear user from local storage and current user subject
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    
    // Show logout toast
    this.presentToast('Sesión finalizada', 'secondary');
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  register(data: RegisterData): boolean {
    // In a real app, this would validate and create a new user
    // For now, we'll simulate successful registration
    if (data.password !== data.confirmPassword) {
      return false;
    }

    const existingUser = this.dataService.getUserByEmail(data.email);
    if (existingUser) {
      return false;
    }

    return true;
  }

  getCurrentUser(): User | null {
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

  // Password strength checker
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

  async changePassword(currentPassword: string, newPassword: string) {
    // Simulate password change validation
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // In a real app, this would involve server-side validation
    if (currentPassword !== user.password) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Update user's password
    user.password = newPassword;
    this.updateUserInLocalStorage(user);

    return true;
  }

  async deleteAccount() {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    // Remove user from local storage
    const users = this.getUsersFromLocalStorage();
    const updatedUsers = users.filter(u => u.id !== user.id);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Clear current user and logout
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');

    return true;
  }

  private updateUserInLocalStorage(updatedUser: User) {
    const users = this.getUsersFromLocalStorage();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user
      this.currentUserSubject.next(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  }

  private getUsersFromLocalStorage(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  updateCurrentUser(updatedUser: User): Observable<boolean> {
    try {
      // Validate input
      if (!updatedUser) {
        return of(false);
      }

      // Update user in local storage
      this.updateUserInLocalStorage(updatedUser);

      // Notify subscribers of the current user change
      this.currentUserSubject.next(updatedUser);

      // Show success toast
      this.presentToast('Perfil actualizado exitosamente', 'success');

      return of(true);
    } catch (error) {
      // Log error and show error toast
      console.error('Error updating user:', error);
      this.presentToast('Error al actualizar el perfil', 'danger');
      return of(false);
    }
  }
}
