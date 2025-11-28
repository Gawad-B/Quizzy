import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../hooks/useAuthQuery';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { login, user, isLoggingIn, loginError } = useAuthQuery();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/';

  // Monitor user state changes for automatic redirection
  useEffect(() => {
    if (user) {
      console.log('🎯 User authenticated, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('🚀 Starting login process...');
      const result = await login(formData.email, formData.password);
      console.log('📋 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to:', from);
        // The useEffect will handle the redirect when user state updates
      } else {
        console.log('❌ Login failed:', result.message);
        setErrors({ general: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-secondary)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            color: 'var(--color-text)',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1rem'
          }}>
            Sign in to your Quizzy account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* General Error */}
          {(errors.general || loginError) && (
            <div style={{
              background: 'var(--color-danger)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {errors.general || 'Login failed. Please try again.'}
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.email ? 'var(--color-danger)' : 'var(--color-border)'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                transition: 'border-color 0.2s ease'
              }}
              placeholder="Enter your email"
              disabled={isLoggingIn}
            />
            {errors.email && (
              <p style={{
                color: 'var(--color-danger)',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: '0'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              color: 'var(--color-text)',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  border: `1px solid ${errors.password ? 'var(--color-danger)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  fontSize: '1rem',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  transition: 'border-color 0.2s ease'
                }}
                placeholder="Enter your password"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  fontSize: '1.2rem',
                  padding: '0.25rem'
                }}
                disabled={isLoggingIn}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <p style={{
                color: 'var(--color-danger)',
                fontSize: '0.75rem',
                marginTop: '0.25rem',
                marginBottom: '0'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: isLoggingIn ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              marginBottom: '1.5rem'
            }}
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            marginBottom: '0'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
