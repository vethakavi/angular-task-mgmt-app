import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '../../models/user.model';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class Profile implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  profileData = signal({ name: '', email: '', phone: '', bio: '' });
  statusMessage = signal('');
  statusType = signal<'success' | 'error' | 'mandatory' | null>(null);
  isSaving = signal(false);

  ngOnInit() {
    this.userService.loadSession();

    const user = this.userService.user();

    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    this.profileData.set({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });
  }

  saveProfile() {
    if (!this.profileData().name.trim()) {
      this.statusMessage.set('Name is required.');
      this.statusType.set('mandatory');
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
      this.statusMessage.set('Unable to update profile: missing user ID.');
      this.statusType.set('error');
      return;
    }

    this.isSaving.set(true);
    this.statusMessage.set('');

    this.userService
      .updateUserProfile(userId, this.profileData())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: User) => {
          const currentUser = this.userService.user() || {};
          const updatedUser =
            res && typeof res === 'object'
              ? { ...currentUser, ...res }
              : { ...currentUser, ...this.profileData() };
          this.userService.setSession(token, updatedUser);
          this.statusMessage.set('✓ Profile updated successfully!');
          this.statusType.set('success');
          this.isSaving.set(false);
        },
        error: () => {
          this.statusMessage.set('✗ Failed to update profile. Please try again.');
          this.statusType.set('error');
          this.isSaving.set(false);
        },
      });
  }
}
