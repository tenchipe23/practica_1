import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Importa Router
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    IonicModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  passwordStrength: 'weak' | 'medium' | 'strong' = 'weak';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router, // Cambia NavController por Router
    private alertController: AlertController
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Monitor password strength
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
      this.passwordStrength = this.authService.checkPasswordStrength(password);
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    return password && confirmPassword && password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const registerData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword
      };

      const success = this.authService.register(registerData);
      
      if (success) {
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: 'Tu cuenta ha sido creada. Inicia sesión para continuar.',
          buttons: [{
            text: 'Iniciar Sesión',
            handler: () => {
              // Usa Router para navegar
              this.router.navigate(['/login'], { 
                replaceUrl: true 
              });
            }
          }]
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Error de Registro',
          message: 'No se pudo crear la cuenta. Verifica tus datos.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  onLogin() {
    // Usa Router para navegar
    this.router.navigate(['/login'], { 
      replaceUrl: true 
    });
  }
}