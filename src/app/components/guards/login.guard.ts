import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

export const loginGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.user()) {
    router.navigate(['/tasks']);
    return false;
  }

  const raw = sessionStorage.getItem('user');
  if (raw) {
    userService.loadSession();
    router.navigate(['/tasks']);
    return false;
  }

  return true;
};
