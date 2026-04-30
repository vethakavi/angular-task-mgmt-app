import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Task } from './components/tasks/task';
import { AddTasks } from './components/add-tasks/add-tasks';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  { path: '', component: Login, pathMatch: 'full' },
  { path: 'tasks', component: Task },
  { path: 'add-tasks', component: AddTasks },
  { path: 'profile', component: Profile },
];
