// authService.ts
import { MOCK_USERS, delay } from './mockData';
import type { User } from './mockData';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  grade?: string;
  graduation_year?: string;
  nationality?: string;
  university?: string;
}

// API functions
export const authAPI = {
  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; user?: User; message?: string }> => {
    await delay(500); // Simulate network delay
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user = MOCK_USERS.find(u => u.email === token);
      if (user) return { success: true, user };
    }
    return { success: false, message: 'Not authenticated' };
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email === credentials.email);

    if (user) {
      if (credentials.password === 'password123' || credentials.password.length >= 6) {
        localStorage.setItem('auth_token', user.email);
        return { success: true, user };
      }
      return { success: false, message: 'Invalid password' };
    }
    return { success: false, message: 'User not found' };
  },

  // Signup
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    await delay(800);
    if (MOCK_USERS.find(u => u.email === credentials.email)) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      email: credentials.email,
      phone: credentials.phone,
      grade: credentials.grade,
      graduation_year: credentials.graduation_year,
      nationality: credentials.nationality,
      university: credentials.university,
      created_at: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    localStorage.setItem('auth_token', newUser.email);
    return { success: true, user: newUser };
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message?: string }> => {
    await delay(300);
    localStorage.removeItem('auth_token');
    return { success: true, message: 'Logged out successfully' };
  },
};

export type { User, AuthResponse, LoginCredentials, SignupCredentials };
