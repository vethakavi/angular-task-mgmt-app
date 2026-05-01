import { Component, inject, signal, DestroyRef } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

  taskService = inject(TaskService);
  userService = inject(UserService);
  router = inject(Router);
  private destroyRef = inject(DestroyRef);

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

    this.taskService
      .login({ email: this.email(), password: this.password() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: LoginResponse) => {
          const token = res.token || res.accessToken || '';
          if (!token) {
            this.statusMessage.set('✗ Unable to retrieve login token. Please try again.');
            this.statusType.set('error');
            this.isLoading.set(false);
            return;
          }

          const sessionUser: User = {
            ...(res.user || { email: this.email() }),
            id: res.user?.id || res.user?._id || null,
          };

          this.userService.setSession(token, sessionUser);
          this.statusMessage.set('✓ Login successful!');
          this.statusType.set('success');
          this.isLoading.set(false);

          if (!res.user || !sessionUser.id) {
            console.log('Fetching full profile because login user data is incomplete.');

            this.userService
              .getUserProfile()
              .pipe(take(1))
              .subscribe({
                next: (profile: User) => {
                  const profileUser: User = {
                    ...(profile || {}),
                    id: profile?.id || profile?._id || sessionUser.id,
                  };
                  this.userService.setSession(token, profileUser);
                },
                error: () => {
                  // fallback to partial session if profile lookup fails
                },
              });
          }

          setTimeout(() => {
            this.router.navigate(['/tasks']);
          }, 500);
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

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage.set('');
      this.statusType.set(null);
    }, delayMs);
  }
}
