import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { AlertController, ToastController, NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

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
    private modalController: ModalController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });

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

    this.loadSettings();
  }

  ngOnInit() {
    try {
      this.user = this.authService.getCurrentUser();
      if (!this.user) {
        this.presentToast('Usuario no obtenido', 'danger');
        this.navCtrl.navigateRoot('/login');
      }
    } catch (error) {
      this.presentToast('No se encontró usuario', 'danger');
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');

    return newPassword && confirmPassword && 
           newPassword.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  async changePassword() {
    if (this.passwordForm.valid) {
      try {
        const result = await this.authService.changePassword(
          this.passwordForm.get('currentPassword')?.value,
          this.passwordForm.get('newPassword')?.value
        );
        
        if (result) {
          this.presentToast('Contraseña Actualizada', 'success');
          this.passwordForm.reset();
        } else {
          this.presentToast('No se pudo cambiar la contraseña', 'danger');
        }
      } catch (error) {
        this.presentToast('Error al cambiar la contraseña', 'danger');
      }
    } else {
      this.presentToast('Por favor complete todos los campos', 'danger');
    }
  }

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
              this.router.navigate(['/login'], { replaceUrl: true });
            } catch (error: any) {
              this.presentToast('No se pudo eliminar la cuenta', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteAccount() {
    const alert = await this.alertController.create({
      header: 'Eliminar Cuenta',
      message: '¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              const result = await this.authService.deleteAccount();
              
              if (result) {
                this.presentToast('Cuenta eliminada', 'secondary');
                this.router.navigate(['/login'], { replaceUrl: true });
              } else {
                this.presentToast('No se pudo eliminar la cuenta', 'danger');
              }
            } catch (error) {
              this.presentToast('Error al eliminar la cuenta', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  toggleDarkMode() {
    this.settings.darkMode = !this.settings.darkMode;
    document.body.classList.toggle('dark', this.settings.darkMode);
    this.saveSettings();
  }

  toggleNotification(type: keyof AppSettings['notifications']) {
    this.settings.notifications[type] = !this.settings.notifications[type];
    this.saveSettings();
  }

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

  private saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(this.settings));
  }

  private loadSettings() {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      this.settings = JSON.parse(savedSettings);
      document.body.classList.toggle('dark', this.settings.darkMode);
    }
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

  navigateBack() {
    this.navCtrl.back();
  }

  getLanguageName(code: string | undefined): string {
    return this.languages.find(lang => lang.code === code)?.name || '';
  }

  getCurrencyName(code: string | undefined): string {
    return this.currencies.find(curr => curr.code === code)?.name || '';
  }
}
