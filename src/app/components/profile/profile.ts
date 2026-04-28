import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class Profile implements OnInit {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UserService);

  profileData = {
    name: '',
    email: '',
    phone: '',
    bio: '',
  };

  statusMessage = '';
  statusType: 'success' | 'error' | 'mandatory' | null = null;
  isSaving = false;

  ngOnInit() {
    this.userService.loadSession();

    const user = this.userService.user();
    console.log('user:', user);

    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.profileData = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    };
  }

  saveProfile() {
    console.log('SaveClicked');
    if (!this.profileData.name.trim()) {
      this.statusMessage = 'Name is required.';
      this.statusType = 'mandatory';
      this.cdr.detectChanges();
      return;
    }

    const token = this.userService.getToken();
    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    const user = this.userService.user();
    const userId = user?.id || user?._id || null;
    console.log('userId:', userId);

    if (!userId) {
      this.statusMessage = 'Unable to update profile: missing user ID.';
      this.statusType = 'error';
      return;
    }

    this.isSaving = true;
    this.statusMessage = '';
    this.cdr.detectChanges();

    this.userService.updateUserProfile(token, userId, this.profileData).subscribe({
      next: (res: any) => {
        const currentUser = this.userService.user() || {};
        const updatedUser =
          res && typeof res === 'object'
            ? { ...currentUser, ...res }
            : { ...currentUser, ...this.profileData };
        this.userService.setSession(token, updatedUser);
        this.statusMessage = '✓ Profile updated successfully!';
        this.statusType = 'success';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Profile update failed:', err);
        this.statusMessage = '✗ Failed to update profile. Please try again.';
        this.statusType = 'error';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }
}
