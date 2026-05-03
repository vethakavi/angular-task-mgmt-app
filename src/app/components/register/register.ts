import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { UserService } from '../../services/user.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  phoneNo = signal('');
  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'error' | 'mandatory' | null>(null);
  isSubmitting = signal(false);

  private userService = inject(UserService);
  private router = inject(Router);

  registerUser() {
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

    const phone = Number(this.phoneNo());
    if (!this.phoneNo().trim() || Number.isNaN(phone) || phone <= 0) {
      this.statusMessage.set('Phone number is required and must be valid.');
      this.statusType.set('mandatory');
      this.clearMessageAfterDelay(3000);
      return;
    }

    this.isSubmitting.set(true);
    this.statusMessage.set('');

    const payload: RegisterRequest = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim(),
      password: this.password(),
      confirmPassword: this.confirmPassword(),
      phoneNo: Number(this.phoneNo()),
    };

    this.userService
      .register(payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.statusMessage.set('✓ Registration successful. Redirecting to login...');
          this.statusType.set('success');
          this.isSubmitting.set(false);
          setTimeout(() => this.router.navigate(['/login']), 1000);
        },
        error: (err: unknown) => {
          this.isSubmitting.set(false);
          const errorResponse = err as { status?: number; error?: { message?: string } };
          const message = errorResponse?.error?.message ?? '';
          if (message.toLowerCase().includes('email')) {
            this.statusMessage.set('✗ Email already registered.');
          } else if (message.toLowerCase().includes('password')) {
            this.statusMessage.set('✗ Passwords do not match.');
          } else if (message.toLowerCase().includes('phone')) {
            this.statusMessage.set('✗ Invalid phone number.');
          } else {
            this.statusMessage.set(message || '✗ Registration failed. Please try again.');
          }
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
