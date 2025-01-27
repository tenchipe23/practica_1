import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/home';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, 
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false] 
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/home';
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.presentToast('Por favor, complete todos los campos correctamente', 'danger');
      return;
    }
  
    const { email, password } = this.loginForm.value;
  
    this.authService.login({ email, password }).subscribe({
      next: (success) => {
        if (success) {
          console.log('Login successful');
          this.router.navigate([this.returnUrl], { replaceUrl: true });
        } else {
          console.log('Login failed');
          this.presentToast('Credenciales incorrectas', 'danger');
        }
      },
      error: (error) => {
        console.error('Login error', error);
        this.presentToast('Error de inicio de sesión', 'danger');
      }
    });
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password'], { replaceUrl: true });
  }

  onRegister() {
    this.router.navigate(['/register'], { replaceUrl: true });
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'secondary' = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    toast.present();
  }
}