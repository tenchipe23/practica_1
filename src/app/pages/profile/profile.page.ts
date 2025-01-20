import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    IonicModule
  ]
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  profileImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: ['']
    });
  }

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber || '',
        address: this.user.address ?? ''
      });
    }
  }

  onSaveChanges() {
    this.updateProfile();
  }

  updateProfile() {
    if (this.profileForm.valid && this.user) {
      const updatedUser = {
        ...this.user,
        name: this.profileForm.get('name')?.value || this.user.name,
        email: this.profileForm.get('email')?.value || this.user.email,
        phoneNumber: this.profileForm.get('phoneNumber')?.value || this.user.phoneNumber,
      } as User;

      // Only add address if it's not an empty string
      const addressValue = this.profileForm.get('address')?.value;
      if (addressValue) {
        (updatedUser as any).address = addressValue;
      }

      this.authService.updateCurrentUser(updatedUser).subscribe({
        next: (result: boolean) => {
          if (result) {
            this.presentToast('Perfil actualizado exitosamente', 'success');
          } else {
            this.presentToast('No se pudo actualizar el perfil', 'danger');
          }
        },
        error: (err: Error) => {
          this.presentToast('Error al actualizar el perfil', 'danger');
          console.error('Profile update error', err);
        }
      });
    }
  }

  onBack() {
    this.navCtrl.back();
  }

  onLogout() {
    this.authService.logout();
  }

  changeProfilePicture() {
    // TODO: Implement profile picture change functionality
    this.presentToast('Cambio de foto de perfil próximamente', 'secondary');
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
}
