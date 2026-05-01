import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment.prod'; // prod for renderer deployment
import { User } from '../models/user.model';
import { ProfileUpdateRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private API = environment.apiUrl;
  user = signal<User | null>(this.loadFromStorage());

  private loadFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  loadSession(): void {
    if (!this.user()) {
      const raw = localStorage.getItem('user');
      if (raw) {
        this.user.set(JSON.parse(raw));
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
  }

  updateUserProfile(userId: string, profile: ProfileUpdateRequest) {
    return this.http.put<User>(`${this.API}/auth/user/${userId}`, profile);
  }

  getUserProfile() {
    return this.http.get<User>(`${this.API}/auth/user`);
  }
}
