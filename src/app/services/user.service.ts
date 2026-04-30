import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private API = 'http://localhost:5000/api';
  user = signal<any | null>(this.loadFromStorage());

  private loadFromStorage() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  loadSession() {
    if (!this.user()) {
      const raw = localStorage.getItem('user');
      if (raw) {
        this.user.set(JSON.parse(raw));
      }
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setSession(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.user.set(user);
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.set(null);
  }

  private getHeaders(token: string) {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  updateUserProfile(token: string, userId: any, profile: any) {
    return this.http.put(`${this.API}/auth/user/${userId}`, profile, this.getHeaders(token));
  }

  getUserProfile(token: string) {
    return this.http.get(`${this.API}/auth/user`, this.getHeaders(token));
  }
}
