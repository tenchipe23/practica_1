import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  NavController, 
  AlertController, 
  ModalController, 
  ActionSheetController 
} from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

interface AppSettings {
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    promotions: boolean;
  };
  language: string;
  currency: string;
}

interface LanguageOption {
  code: string;
  name: string;
}

interface CurrencyOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    IonicModule
  ]
})
export class SettingsPage implements OnInit {
  user: User | null = null;
  passwordForm: FormGroup;
  settings: AppSettings;

  languages: LanguageOption[] = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  currencies: CurrencyOption[] = [
    { code: 'USD', name: 'Dólares (USD)' },
    { code: 'MXN', name: 'Pesos Mexicanos (MXN)' }
  ];

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController
  ) {
    // Password change form
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });

    // Default settings
    this.settings = {
      darkMode: false,
      notifications: {
        email: true,
        push: true,
        promotions: false
      },
      language: 'es',
      currency: 'USD'
    };

    // Load saved settings
    this.loadSettings();
  }

  ngOnInit() {
    // Añade un log para verificar
    console.log('Intentando obtener usuario actual');
    this.user = this.authService.getCurrentUser();
    console.log('Usuario obtenido:', this.user);
  
    if (!this.user) {
      console.warn('No se encontró usuario actual');
      // Redirigir al login si no hay usuario
      this.navCtrl.navigateRoot('/login');
    }
  }

  // Custom validator to ensure password match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    return newPassword && confirmPassword && 
           newPassword.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  // Change password
  async changePassword() {
    if (this.passwordForm.valid) {
      try {
        await this.authService.changePassword(
          this.passwordForm.get('currentPassword')?.value,
          this.passwordForm.get('newPassword')?.value
        );

        const alert = await this.alertController.create({
          header: 'Contraseña Actualizada',
          message: 'Tu contraseña ha sido cambiada exitosamente.',
          buttons: ['OK']
        });
        await alert.present();

        // Reset form
        this.passwordForm.reset();
      } catch (error: any) {
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'No se pudo cambiar la contraseña.',
          buttons: ['OK']
        });
        await alert.present();
      }
    }
  }

  // Toggle dark mode
  toggleDarkMode() {
    this.settings.darkMode = !this.settings.darkMode;
    document.body.classList.toggle('dark', this.settings.darkMode);
    this.saveSettings();
  }

  // Toggle notifications
  toggleNotification(type: keyof AppSettings['notifications']) {
    this.settings.notifications[type] = !this.settings.notifications[type];
    this.saveSettings();
  }

  // Open language selection
  async openLanguageSelection() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar Idioma',
      buttons: this.languages.map(lang => ({
        text: lang.name,
        handler: () => {
          this.settings.language = lang.code;
          this.saveSettings();
        }
      }))
    });
    await actionSheet.present();
  }

  // Open currency selection
  async openCurrencySelection() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar Moneda',
      buttons: this.currencies.map(currency => ({
        text: currency.name,
        handler: () => {
          this.settings.currency = currency.code;
          this.saveSettings();
        }
      }))
    });
    await actionSheet.present();
  }

  // Save settings to local storage
  private saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(this.settings));
  }

  // Load settings from local storage
  private loadSettings() {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
      
      // Apply dark mode
      document.body.classList.toggle('dark', this.settings.darkMode);
    }
  }

  // Delete account
  async deleteAccount() {
    const alert = await this.alertController.create({
      header: 'Eliminar Cuenta',
      message: '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          cssClass: 'delete-account-button',
          handler: async () => {
            try {
              await this.authService.deleteAccount();
              this.navCtrl.navigateRoot('/login');
            } catch (error: any) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: error.message || 'No se pudo eliminar la cuenta.',
                buttons: ['OK']
              });
              await errorAlert.present();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // Navigation
  navigateBack() {
    this.navCtrl.back();
  }

  // Helper methods for template
  getLanguageName(code: string | undefined): string {
    return this.languages.find(lang => lang.code === code)?.name || '';
  }

  getCurrencyName(code: string | undefined): string {
    return this.currencies.find(curr => curr.code === code)?.name || '';
  }
}
