import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../hooks/useAuthQuery';
import { authAPI } from '../../services/authService';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LAST_AUTH_EMAIL_KEY = 'quizzy_last_auth_email';

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [infoMessage, setInfoMessage] = useState<string>('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, user, isLoggingIn, loginError } = useAuthQuery();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/';

  // Monitor user state changes for automatic redirection
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  useEffect(() => {
    const message = location.state?.signupSuccess;
    if (message) {
      setInfoMessage(String(message));
    }

    const prefillEmail = location.state?.prefillEmail;
    if (prefillEmail && typeof prefillEmail === 'string') {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
    }

    const rememberedEmail = localStorage.getItem(LAST_AUTH_EMAIL_KEY);
    if (!prefillEmail && rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }

    if (location.state?.signupSuccess || location.state?.prefillEmail) {
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [resendCooldown]);

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
      setResendMessage('');
      const result = await login(formData.email, formData.password);
      console.log('📋 Login result:', result);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem(LAST_AUTH_EMAIL_KEY, formData.email.trim());
        } else {
          localStorage.removeItem(LAST_AUTH_EMAIL_KEY);
        }
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

  const canResendVerification = (errors.general || '').toLowerCase().includes('verify your email');

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResendingVerification) {
      return;
    }

    if (!formData.email || !formData.password) {
      setErrors({ general: 'Enter your email and password, then retry resending verification.' });
      return;
    }

    setIsResendingVerification(true);
    setResendMessage('');

    const result = await authAPI.resendVerificationEmail({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      setResendMessage(result.message || 'Verification email sent. Please check your inbox.');
      setResendCooldown(60);
    } else {
      setErrors({ general: result.message || 'Unable to resend verification email.' });
    }

    setIsResendingVerification(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1f3a 100%)',
      padding: '1rem',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'auto'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 100px rgba(102, 126, 234, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Login
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            margin: 0
          }}>
            Sign in to continue your journey
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

          {infoMessage && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: 'white',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {infoMessage}
              <div style={{ marginTop: '0.55rem' }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification || resendCooldown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#93e9ff',
                    textDecoration: 'underline',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: isResendingVerification || resendCooldown > 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isResendingVerification
                    ? 'Resending verification...'
                    : resendCooldown > 0
                      ? `Resend available in ${resendCooldown}s`
                      : 'Resend verification email'}
                </button>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '0.6rem'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              placeholder="Enter your email"
              disabled={isLoggingIn}
              onFocus={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)'}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label htmlFor="password" style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  color: 'rgba(0, 212, 255, 0.8)',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  paddingRight: '3rem',
                  border: `2px solid ${errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                disabled={isLoggingIn}
                onFocus={(e) => e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}
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

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoggingIn}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '0.5rem',
                cursor: 'pointer',
                accentColor: '#00d4ff'
              }}
            />
            <label htmlFor="remember" style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}>
              Remember Me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: '100%',
              padding: '1rem',
              background: isLoggingIn ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
              boxShadow: isLoggingIn ? 'none' : '0 8px 20px rgba(0, 212, 255, 0.3)',
              textTransform: 'none',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => !isLoggingIn && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 212, 255, 0.4)')}
            onMouseLeave={(e) => !isLoggingIn && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 212, 255, 0.3)')}
          >
            {isLoggingIn ? 'Logging In...' : 'Log In'}
          </button>

          {canResendVerification && (
            <button
              type="button"
              disabled={isResendingVerification || resendCooldown > 0}
              onClick={handleResendVerification}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: isResendingVerification || resendCooldown > 0 ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
              }}
            >
              {isResendingVerification
                ? 'Sending verification...'
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend Verification Email'}
            </button>
          )}

          {resendMessage && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: 'white',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {resendMessage}
            </div>
          )}
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            marginBottom: '0'
          }}>
            Don't have a account{' '}
            <Link to="/signup" style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
              fontWeight: '700'
            }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
