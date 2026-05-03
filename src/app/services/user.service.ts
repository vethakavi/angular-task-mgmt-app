import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment'; // prod for renderer deployment
import { User, RegisterRequest } from '../models/user.model';
import { LoginRequest, LoginResponse, ProfileUpdateRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private API = environment.apiUrl;
  user = signal<User | null>(this.loadFromStorage());

  private loadFromStorage(): User | null {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  loadSession(): void {
    if (!this.user()) {
      const raw = sessionStorage.getItem('user');
      if (raw) {
        this.user.set(JSON.parse(raw));
      }
    }
  }

  setSession(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  clearSession(): void {
    sessionStorage.removeItem('user');
    this.user.set(null);
  }

  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, data);
  }

  register(data: RegisterRequest) {
    return this.http.post<User>(`${this.API}/auth/register`, data);
  }

  updateUserProfile(userId: string, profile: ProfileUpdateRequest) {
    return this.http.put<User>(`${this.API}/auth/user/${userId}`, profile);
  }

  checkUserExists(email: string) {
    return this.http.get<{ exists: boolean }>(
      `${this.API}/auth/user/exists?email=${encodeURIComponent(email)}`,
    );
  }

  resetPassword(data: { email: string; password: string }) {
    return this.http.post(`${this.API}/auth/reset-password`, data);
  }

  getUserProfile() {
    return this.http.get<User>(`${this.API}/auth/user`);
  }
}
