import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuthQuery } from '../../hooks/useAuthQuery';
import { authAPI } from '../../services/authService';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

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
  const [showSignupResendNotice, setShowSignupResendNotice] = useState(false);
  const { isDarkMode } = useTheme();
  
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

    setShowSignupResendNotice(Boolean(location.state?.canResendVerification));

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
      console.log('Starting login process...');
      setResendMessage('');
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem(LAST_AUTH_EMAIL_KEY, formData.email.trim());
        } else {
          localStorage.removeItem(LAST_AUTH_EMAIL_KEY);
        }
        console.log('Login successful, redirecting to:', from);
        // The useEffect will handle the redirect when user state updates
      } else {
        console.log('Login failed:', result.message);
        setErrors({ general: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const canResendVerification = (errors.general || '').toLowerCase().includes('verify your email');
  const shouldShowInfoResend =
    showSignupResendNotice || /verif(y|ication)/i.test(infoMessage);

  const pageBackground = isDarkMode
    ? 'radial-gradient(circle at top right, #1a1a1f 0%, #0b0b0c 60%, #050506 100%)'
    : 'radial-gradient(circle at top right, #f1f5f9 0%, #f7f7f8 55%, #ffffff 100%)';
  const cardBackground = isDarkMode ? '#131316' : '#ffffff';
  const cardBorder = isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.1)';
  const textPrimary = isDarkMode ? '#f4f4f5' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(244, 244, 245, 0.72)' : '#475569';
  const inputBackground = isDarkMode ? '#101013' : '#ffffff';
  const inputBorder = isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.16)';
  const inputFocusBorder = isDarkMode ? 'rgba(255,255,255,0.56)' : 'rgba(15,23,42,0.56)';
  const primaryButtonBackground = isDarkMode ? '#f4f4f5' : '#111827';
  const primaryButtonText = isDarkMode ? '#0b0b0c' : '#ffffff';
  const primaryButtonHover = isDarkMode ? '#ffffff' : '#0b1220';
  const noticeBackground = isDarkMode ? 'rgba(244, 244, 245, 0.08)' : 'rgba(15, 23, 42, 0.05)';
  const noticeBorder = isDarkMode ? '1px solid rgba(244, 244, 245, 0.24)' : '1px solid rgba(15, 23, 42, 0.16)';
  const errorBackground = isDarkMode ? 'rgba(239, 68, 68, 0.16)' : 'rgba(220, 38, 38, 0.12)';
  const errorBorder = isDarkMode ? '1px solid rgba(248, 113, 113, 0.38)' : '1px solid rgba(220, 38, 38, 0.28)';
  const errorText = isDarkMode ? '#fecaca' : '#991b1b';

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
      setResendMessage(result.message || 'Verification email sent. Please check your inbox and spam folder.');
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
      background: pageBackground,
      padding: '1rem',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'auto'
    }}>
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
          borderRadius: '999px',
          border: cardBorder,
          background: cardBackground,
          color: textPrimary,
        }}
      >
        <ThemeToggle size="small" />
      </div>

      <div style={{
        background: cardBackground,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: cardBorder,
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        boxShadow: isDarkMode ? '0 20px 60px rgba(0, 0, 0, 0.45)' : '0 20px 60px rgba(15, 23, 42, 0.12)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            color: textPrimary,
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Login
          </h1>
          <p style={{
            color: textSecondary,
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
              background: errorBackground,
              color: errorText,
              border: errorBorder,
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
              background: noticeBackground,
              color: textPrimary,
              border: noticeBorder,
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {infoMessage}
              {shouldShowInfoResend && (
                <div style={{ marginTop: '0.55rem' }}>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification || resendCooldown > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: isDarkMode ? '#d4d4d8' : '#334155',
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
              )}
            </div>
          )}

          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              color: textPrimary,
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
                border: `2px solid ${errors.email ? '#ef4444' : inputBorder}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: inputBackground,
                color: textPrimary,
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              placeholder="Enter your email"
              disabled={isLoggingIn}
              onFocus={(e) => e.target.style.borderColor = inputFocusBorder}
              onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : inputBorder}
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
                color: textPrimary,
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{
                  color: textSecondary,
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
                  border: `2px solid ${errors.password ? '#ef4444' : inputBorder}`,
                  borderRadius: '12px',
                  fontSize: '1rem',
                  background: inputBackground,
                  color: textPrimary,
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                disabled={isLoggingIn}
                onFocus={(e) => e.target.style.borderColor = inputFocusBorder}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : inputBorder}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                  color: textSecondary,
                  padding: 0,
                  lineHeight: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={isLoggingIn}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon sx={{ fontSize: 22, color: textSecondary }} />
                ) : (
                  <VisibilityOutlinedIcon sx={{ fontSize: 22, color: textSecondary }} />
                )}
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
                accentColor: isDarkMode ? '#f4f4f5' : '#111827'
              }}
            />
            <label htmlFor="remember" style={{
              color: textSecondary,
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
              background: isLoggingIn ? 'rgba(100, 100, 100, 0.5)' : primaryButtonBackground,
              color: primaryButtonText,
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
              boxShadow: isLoggingIn
                ? 'none'
                : isDarkMode
                  ? '0 8px 20px rgba(0, 0, 0, 0.35)'
                  : '0 8px 20px rgba(15, 23, 42, 0.2)',
              textTransform: 'none',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => !isLoggingIn && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.background = primaryButtonHover)}
            onMouseLeave={(e) => !isLoggingIn && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.background = primaryButtonBackground)}
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
                background: isDarkMode ? '#1f1f23' : '#f8fafc',
                color: textPrimary,
                border: cardBorder,
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
              background: noticeBackground,
              color: textPrimary,
              border: noticeBorder,
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
            color: textSecondary,
            fontSize: '0.9rem',
            marginBottom: '0'
          }}>
            Don't have a account{' '}
            <Link to="/signup" style={{
              color: textPrimary,
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
