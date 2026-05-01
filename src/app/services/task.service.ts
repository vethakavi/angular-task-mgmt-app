// src/app/services/task.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { CreateTask, Tasks } from '../models/tasks-model';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  http = inject(HttpClient);
  private API = environment.apiUrl;

  login = (data: LoginRequest) => this.http.post<LoginResponse>(`${this.API}/auth/login`, data);

  getTasks = () => this.http.get<Tasks[]>(`${this.API}/tasks`);

  createTask = (task: CreateTask) => this.http.post<Tasks>(`${this.API}/tasks`, task);

  updateTask = (taskId: string, task: Partial<Tasks>) =>
    this.http.put<Tasks>(`${this.API}/tasks/${taskId}`, task);

  deleteTask = (taskId: string) => this.http.delete<void>(`${this.API}/tasks/${taskId}`);
}
