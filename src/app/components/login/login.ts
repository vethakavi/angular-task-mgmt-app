import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginResponse } from '../../models/auth.model';
import { User } from '../../models/user.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = signal('');
  password = signal('');
  statusMessage = signal<string | null>(null);
  statusType = signal<'success' | 'error' | 'mandatory' | null>(null);
  isLoading = signal(false);

  userService = inject(UserService);
  router = inject(Router);

  loginUser() {
    this.statusMessage.set(null);
    this.statusType.set(null);

    if (!this.email().trim()) {
      this.statusMessage.set('Email is required.');
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

    this.isLoading.set(true);
    this.statusMessage.set('');

    this.userService
      .login({ email: this.email(), password: this.password() })
      .pipe(take(1))
      .subscribe({
        next: (res: LoginResponse) => {
          const sessionUser: User = {
            ...(res.user || { email: this.email() }),
            id: res.user?.id || res.user?._id || null,
          };

          this.userService.setSession(sessionUser);
          this.statusMessage.set('✓ Login successful!');
          this.statusType.set('success');
          this.isLoading.set(false);

          if (!res.user || !sessionUser.id) {
            this.userService
              .getUserProfile()
              .pipe(take(1))
              .subscribe({
                next: (profile: User) => {
                  const profileUser: User = {
                    ...(profile || {}),
                    id: profile?.id || profile?._id || sessionUser.id,
                  };
                  this.userService.setSession(profileUser);
                  this.navigateToTasks();
                },
                error: (err) => {
                  console.error('Profile fetch failed:', err);
                  this.navigateToTasks();
                },
              });
          } else {
            this.navigateToTasks();
          }
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
          const error = err as { status?: number };
          if (error.status === 400) {
            this.statusMessage.set('✗ Invalid email or password. Please try again.');
            this.statusType.set('error');
          } else if (error.status === 401) {
            this.statusMessage.set('✗ Unauthorized. Please check your credentials.');
            this.statusType.set('error');
          } else if (error.status === 0) {
            this.statusMessage.set('✗ Server unreachable. Please try again later.');
            this.statusType.set('error');
          } else {
            this.statusMessage.set('✗ Login failed. Please check your credentials.');
            this.statusType.set('error');
          }
          this.clearMessageAfterDelay(3000);
        },
      });
  }

  private navigateToTasks() {
    setTimeout(() => {
      this.router.navigate(['/tasks']).then((result) => {
        console.log('Navigation result:', result);
      });
    }, 500);
  }
  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage.set('');
      this.statusType.set(null);
    }, delayMs);
  }
}
