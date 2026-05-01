import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Task } from './components/tasks/task';
import { AddTasks } from './components/add-tasks/add-tasks';
import { Profile } from './components/profile/profile';
import { authGuard } from './components/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'tasks', component: Task, canActivate: [authGuard] },
  { path: 'add-tasks', component: AddTasks, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];
