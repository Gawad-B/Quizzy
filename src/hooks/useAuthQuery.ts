// useAuthQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, type User, type LoginCredentials, type SignupCredentials } from '../services/authService';

// Query keys
export const authKeys = {
  user: ['auth', 'user'] as const,
};

export const useAuthQuery = () => {
  const queryClient = useQueryClient();

  // Get current user query
  const {
    data: userData,
    isLoading: loading,
    error,
    refetch: checkAuth,
  } = useQuery({
    queryKey: authKeys.user,
    queryFn: authAPI.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Update the user query cache
        queryClient.setQueryData(authKeys.user, { success: true, user: data.user });
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data) => {
      if (data.success && data.user) {
        // Update the user query cache
        queryClient.setQueryData(authKeys.user, { success: true, user: data.user });
      }
    },
    onError: (error) => {
      console.error('Signup failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear the user query cache
      queryClient.setQueryData(authKeys.user, { success: false, user: undefined });
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.user });
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  // Helper functions
  const login = async (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const signup = async (credentials: SignupCredentials) => {
    return signupMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  // Get current user function
  const getCurrentUser = async () => {
    return checkAuth();
  };

  // Extract user and success from the query data
  const user = userData?.user || null;
  const isAuthenticated = !!user;

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,

    // Mutations
    login,
    signup,
    logout,

    // Queries
    checkAuth,
    getCurrentUser,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error,
    signupError: signupMutation.error,
    logoutError: logoutMutation.error,
  };
};
