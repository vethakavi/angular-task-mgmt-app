import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Task } from './components/tasks/task';
import { AddTasks } from './components/add-tasks/add-tasks';
import { Profile } from './components/profile/profile';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { authGuard } from './components/guards/auth.guard';
import { loginGuard } from './components/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [loginGuard] },
  { path: 'register', component: Register, canActivate: [loginGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [loginGuard] },
  { path: 'tasks', component: Task, canActivate: [authGuard] },
  { path: 'add-tasks', component: AddTasks, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
