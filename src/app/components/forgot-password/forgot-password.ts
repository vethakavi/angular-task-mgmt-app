import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'error' | 'mandatory' | null>(null);
  isSubmitting = signal(false);
  step = signal<'email' | 'reset'>('email');

  private userService = inject(UserService);
  private router = inject(Router);

  checkEmail() {
    this.statusMessage.set(null);
    this.statusType.set(null);

    if (!this.email().trim()) {
      this.statusMessage.set('Email is required.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    if (!this.validateEmail(this.email())) {
      this.statusMessage.set('Please enter a valid email address.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    this.isSubmitting.set(true);
    this.statusMessage.set('');

    this.userService
      .checkUserExists(this.email().trim())
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          if (res.exists) {
            this.step.set('reset');
            this.statusMessage.set('User found. Please enter your new password.');
            this.statusType.set('success');
          } else {
            this.statusMessage.set('User not found. Redirecting to registration...');
            this.statusType.set('error');
            setTimeout(() => this.router.navigate(['/register']), 2000);
          }
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const errorResponse = err as { status?: number; error?: { message?: string } };
          this.statusMessage.set(
            errorResponse?.error?.message || 'Failed to check user. Please try again.',
          );
          this.statusType.set('error');
          this.clearMessageAfterDelay(4000);
        },
      });
  }

  resetPassword() {
    this.statusMessage.set(null);
    this.statusType.set(null);

    if (!this.password().trim()) {
      this.statusMessage.set('Password is required.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    if (!this.confirmPassword().trim()) {
      this.statusMessage.set('Confirm password is required.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.statusMessage.set('Passwords do not match.');
      this.statusType.set('error');
      this.clearMessageAfterDelay(3000);
      return;
    }

    this.isSubmitting.set(true);
    this.statusMessage.set('');

    const payload = {
      email: this.email().trim(),
      password: this.password(),
    };

    this.userService
      .resetPassword(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.statusMessage.set('✓ Password reset successful. Redirecting to login...');
          this.statusType.set('success');
          this.isSubmitting.set(false);
          setTimeout(() => this.router.navigate(['/login']), 1000);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const errorResponse = err as { status?: number; error?: { message?: string } };
          this.statusMessage.set(
            errorResponse?.error?.message || '✗ Password reset failed. Please try again.',
          );
          this.statusType.set('error');
          this.clearMessageAfterDelay(4000);
        },
      });
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage.set(null);
      this.statusType.set(null);
    }, delayMs);
  }
}
