export interface User {
  id?: string | null;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNo?: number;
  role?: 'user' | 'admin';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNo: number;
}
