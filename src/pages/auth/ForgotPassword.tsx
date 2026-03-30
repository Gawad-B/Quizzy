import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/authService';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

interface FormErrors {
  email?: string;
  general?: string;
}

const LAST_AUTH_EMAIL_KEY = 'quizzy_last_auth_email';

const ForgotPassword = () => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const pageBackground = isDarkMode
    ? 'radial-gradient(circle at top right, #1a1a1f 0%, #0b0b0c 60%, #050506 100%)'
    : 'radial-gradient(circle at top right, #f1f5f9 0%, #f7f7f8 55%, #ffffff 100%)';
  const cardBackground = isDarkMode ? '#131316' : '#ffffff';
  const cardBorder = isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(15,23,42,0.1)';
  const textPrimary = isDarkMode ? '#f4f4f5' : '#0f172a';
  const textSecondary = isDarkMode ? 'rgba(244, 244, 245, 0.72)' : '#475569';
  const inputBackground = isDarkMode ? '#101013' : '#ffffff';
  const inputBorder = isDarkMode ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.16)';
  const primaryButtonBackground = isDarkMode ? '#f4f4f5' : '#111827';
  const primaryButtonText = isDarkMode ? '#0b0b0c' : '#ffffff';

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!email) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Email is invalid';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    const result = await authAPI.requestPasswordReset({ email });

    if (result.success) {
      localStorage.setItem(LAST_AUTH_EMAIL_KEY, email.trim());
      setSuccessMessage(result.message || 'Password reset email sent. Please check your inbox.');
      setEmail('');
    } else {
      setErrors({ general: result.message || 'Unable to send password reset email.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: pageBackground,
        padding: '1rem',
      }}
    >
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

      <div
        style={{
          background: cardBackground,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: cardBorder,
          borderRadius: '24px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '460px',
          boxShadow: isDarkMode ? '0 20px 60px rgba(0, 0, 0, 0.45)' : '0 20px 60px rgba(15, 23, 42, 0.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1
            style={{
              color: textPrimary,
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: textSecondary, margin: 0 }}>
            Enter your account email and we will send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div
              style={{
                background: 'var(--color-danger)',
                color: 'white',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {errors.general}
            </div>
          )}

          {successMessage && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.2)',
                color: 'white',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              {successMessage}
            </div>
          )}

          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                color: textPrimary,
                fontSize: '0.9rem',
                fontWeight: 500,
                marginBottom: '0.6rem',
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: `2px solid ${errors.email ? '#ef4444' : inputBorder}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: inputBackground,
                color: textPrimary,
                outline: 'none',
              }}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: isSubmitting
                ? 'rgba(100, 100, 100, 0.5)'
                : primaryButtonBackground,
              color: primaryButtonText,
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              color: textPrimary,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
