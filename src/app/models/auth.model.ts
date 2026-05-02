import { User } from './user.model';
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  accessToken?: string;
  user?: User;
}
export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
}
