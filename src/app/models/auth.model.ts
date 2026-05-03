import { User } from './user.model';
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  message?: string;
}
export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: number;
}
