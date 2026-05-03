import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { take } from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  imports: [CommonModule, FormsModule, RouterLink],
})
export class Profile implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phoneNo = signal('');
  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'error' | 'mandatory' | null>(null);
  isSaving = signal(false);

  ngOnInit() {
    this.userService.loadSession();
    const user = this.userService.user();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.firstName.set(user.firstName || '');
    this.lastName.set(user.lastName || '');
    this.email.set(user.email || '');
    this.phoneNo.set(user.phoneNo?.toString() || '');
  }

  saveProfile() {
    this.statusMessage.set(null);
    this.statusType.set(null);

    if (!this.firstName().trim()) {
      this.statusMessage.set('First name is required.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    if (!this.lastName().trim()) {
      this.statusMessage.set('Last name is required.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    const phone = Number(this.phoneNo());
    if (!this.phoneNo().trim() || Number.isNaN(phone) || phone <= 0) {
      this.statusMessage.set('Phone number is required and must be valid.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    const user = this.userService.user();
    const userId = user?.id || user?._id || null;

    if (!userId) {
      this.statusMessage.set('Unable to update profile: missing user ID.');
      this.statusType.set('error');
      this.clearMessageAfterDelay(4000);
      return;
    }

    this.isSaving.set(true);
    this.statusMessage.set('');

    const payload = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      phoneNo: this.phoneNo() ? Number(this.phoneNo()) : 0,
    };

    this.userService
      .updateUserProfile(userId, payload)
      .pipe(take(1))
      .subscribe({
        next: (res: User) => {
          const currentUser = this.userService.user() || {};
          const updatedUser =
            res && typeof res === 'object'
              ? { ...currentUser, ...res }
              : { ...currentUser, ...payload };
          this.userService.setSession(updatedUser);
          this.statusMessage.set('✓ Profile updated successfully!');
          this.statusType.set('success');
          this.isSaving.set(false);
          this.clearMessageAfterDelay(3000);
        },
        error: () => {
          this.statusMessage.set('✗ Failed to update profile. Please try again.');
          this.statusType.set('error');
          this.isSaving.set(false);
          this.clearMessageAfterDelay(4000);
        },
      });
  }

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage.set(null);
      this.statusType.set(null);
    }, delayMs);
  }
}
