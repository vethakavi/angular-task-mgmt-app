import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  form = {
    email: '',
    password: '',
  };
  statusMessage: string | null = null;
  statusType: 'success' | 'error' | 'mandatory' | null = null;
  isLoading = false;
  taskService = inject(TaskService);
  userService = inject(UserService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  loginUser() {
    this.statusMessage = null;
    if (!this.form.email.trim()) {
      this.statusMessage = 'Email is required.';
      this.statusType = 'mandatory';
      this.cdr.detectChanges();
      this.clearMessageAfterDelay(3000);
      return;
    }

    if (!this.form.password.trim()) {
      this.statusMessage = 'Password is required.';
      this.statusType = 'mandatory';
      this.cdr.detectChanges();
      this.clearMessageAfterDelay(3000);
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';
    this.cdr.detectChanges(); // ✅ Force loading state to show

    this.taskService.login(this.form).subscribe({
      next: (res: any) => {
        const token = res.token || res.accessToken || '';
        if (!token) {
          this.statusMessage = '✗ Unable to retrieve login token. Please try again.';
          this.statusType = 'error';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }

        const sessionUser = {
          ...(res.user || { email: this.form.email }),
          id: res.user?.id || res.user?._id || null,
        };

        this.userService.setSession(token, sessionUser);
        this.statusMessage = '✓ Login successful!';
        this.statusType = 'success';
        this.isLoading = false;
        this.cdr.detectChanges();

        if (!res.user || !sessionUser.id) {
          console.log('Fetching full profile because login user data is incomplete.');

          this.userService.getUserProfile(token).subscribe({
            next: (profile: any) => {
              const profileUser = {
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
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.statusMessage = '✗ Invalid email or password. Please try again.';
          this.statusType = 'error';
        } else if (err.status === 401) {
          this.statusMessage = '✗ Unauthorized. Please check your credentials.';
          this.statusType = 'error';
        } else if (err.status === 0) {
          this.statusMessage = '✗ Server unreachable. Please try again later.';
          this.statusType = 'error';
        } else {
          this.statusMessage = '✗ Login failed. Please check your credentials.';
          this.statusType = 'error';
        }
        this.cdr.detectChanges(); // Force loading state to show
        this.clearMessageAfterDelay(3000);
      },
    });
  }

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage = '';
      this.cdr.detectChanges(); // Force clear message
    }, delayMs);
  }
}
