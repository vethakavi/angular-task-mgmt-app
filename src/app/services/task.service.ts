import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { CreateTask, Tasks } from '../models/tasks-model';
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  http = inject(HttpClient);
  private API = environment.apiUrl;

  getTasks() {
    return this.http.get<Tasks[]>(`${this.API}/tasks`);
  }

  createTask(task: CreateTask) {
    return this.http.post<Tasks>(`${this.API}/tasks`, task);
  }

  updateTask(taskId: string, task: Partial<Tasks>) {
    return this.http.put<Tasks>(`${this.API}/tasks/${taskId}`, task);
  }

  deleteTask(taskId: string) {
    return this.http.delete<void>(`${this.API}/tasks/${taskId}`);
  }
}
