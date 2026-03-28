import { http } from '../lib/http';
import type { User } from './mockData';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
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
  grade: string;
  graduation_year?: string;
  nationality: string;
  university: string;
}

interface PasswordResetRequestPayload {
  email: string;
}

interface PasswordResetConfirmPayload {
  oobCode: string;
  newPassword: string;
}

interface ResendVerificationPayload {
  email: string;
  password: string;
}

interface ApplyActionPayload {
  mode: 'verifyEmail' | 'recoverEmail';
  oobCode: string;
}

export const authAPI = {
  // Get current user
  getCurrentUser: async (): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const data = await http<{ success: boolean; user?: User; message?: string }>('/api/auth/me');
      return data;
    } catch (error) {
      return { success: false, message: 'Not authenticated' };
    }
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const data = await http<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  },

  // Signup
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const data = await http<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: credentials,
      });
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      return data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  },

  requestPasswordReset: async (payload: PasswordResetRequestPayload): Promise<AuthResponse> => {
    try {
      return await http<AuthResponse>('/api/auth/password-reset/request', {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to send password reset email' };
    }
  },

  confirmPasswordReset: async (payload: PasswordResetConfirmPayload): Promise<AuthResponse> => {
    try {
      return await http<AuthResponse>('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to reset password' };
    }
  },

  resendVerificationEmail: async (payload: ResendVerificationPayload): Promise<AuthResponse> => {
    try {
      return await http<AuthResponse>('/api/auth/email-verification/resend', {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to resend verification email' };
    }
  },

  applyActionCode: async (payload: ApplyActionPayload): Promise<AuthResponse> => {
    try {
      return await http<AuthResponse>('/api/auth/action/apply', {
        method: 'POST',
        body: payload,
      });
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to process email action' };
    }
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message?: string }> => {
    localStorage.removeItem('auth_token');
    return { success: true, message: 'Logged out successfully' };
  },
};

export type {
  User,
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
  ResendVerificationPayload,
  ApplyActionPayload,
};
