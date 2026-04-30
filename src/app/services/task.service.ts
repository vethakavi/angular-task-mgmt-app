// src/app/services/task.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  http = inject(HttpClient);
  private API = environment.apiUrl;

  private getHeaders(token: string) {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`, // Bearer prefix added
      }),
    };
  }

  login = (data: any) => this.http.post(`${this.API}/auth/login`, data);

  getTasks = (token: any) => this.http.get(`${this.API}/tasks`, this.getHeaders(token));

  createTask = (token: any, task: any) =>
    this.http.post(`${this.API}/tasks`, task, this.getHeaders(token));

  updateTask = (token: any, taskId: string, task: any) =>
    this.http.put(`${this.API}/tasks/${taskId}`, task, this.getHeaders(token));

  deleteTask = (token: any, taskId: string) =>
    this.http.delete(`${this.API}/tasks/${taskId}`, this.getHeaders(token));
}
