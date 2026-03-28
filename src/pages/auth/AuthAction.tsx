import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/authService';

type SupportedMode = 'verifyEmail' | 'recoverEmail' | 'resetPassword';

function toSupportedMode(value: string | null): SupportedMode | null {
  if (value === 'verifyEmail' || value === 'recoverEmail' || value === 'resetPassword') {
    return value;
  }

  return null;
}

const AuthAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = toSupportedMode(searchParams.get('mode'));
  const oobCode = searchParams.get('oobCode') || '';
  const emailFromQuery = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoProcessedRef = useRef(false);

  const title = useMemo(() => {
    if (mode === 'verifyEmail') return 'Verify Email';
    if (mode === 'recoverEmail') return 'Recover Email';
    if (mode === 'resetPassword') return 'Reset Password';
    return 'Invalid Action';
  }, [mode]);

  const hasValidAction = Boolean(mode && oobCode);

  const handleVerifyOrRecover = async () => {
    if (!mode || mode === 'resetPassword' || !oobCode) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    const result = await authAPI.applyActionCode({ mode, oobCode });

    if (result.success) {
      setStatusMessage(result.message || 'Action completed successfully.');
    } else {
      setErrorMessage(result.message || 'Unable to process this action link.');
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    if (!hasValidAction || mode === 'resetPassword' || hasAutoProcessedRef.current) {
      return;
    }

    hasAutoProcessedRef.current = true;
    void handleVerifyOrRecover();
  }, [hasValidAction, mode]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    if (mode === 'verifyEmail') {
      const timeoutId = setTimeout(() => {
        const prefillEmail = emailFromQuery.trim();

        navigate('/login', {
          replace: true,
          state: {
            signupSuccess: 'Email verified successfully. You can now log in.',
            prefillEmail: prefillEmail || undefined,
          },
        });
      }, 1400);

      return () => clearTimeout(timeoutId);
    }
  }, [statusMessage, mode, navigate, emailFromQuery]);

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!oobCode) {
      setErrorMessage('Missing reset code in URL.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setStatusMessage('');

    const result = await authAPI.confirmPasswordReset({ oobCode, newPassword });

    if (result.success) {
      setStatusMessage(result.message || 'Password reset completed. You can now sign in.');
      setNewPassword('');
      setIsSubmitting(false);

      const prefillEmail = emailFromQuery.trim();
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            signupSuccess: 'Password reset successful. Please log in with your new password.',
            prefillEmail: prefillEmail || undefined,
          },
        });
      }, 1400);
    } else {
      setErrorMessage(result.message || 'Unable to reset password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1f3a 100%)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '2rem',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            {title}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
            Complete your account management action.
          </p>
        </div>

        {!hasValidAction && (
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
            Invalid action link. Please request a new email.
          </div>
        )}

        {errorMessage && (
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
            {errorMessage}
          </div>
        )}

        {statusMessage && (
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
            {statusMessage}
          </div>
        )}

        {hasValidAction && mode === 'resetPassword' && (
          <form onSubmit={handleResetPassword}>
            <label
              htmlFor="newPassword"
              style={{
                display: 'block',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.9rem',
                fontWeight: 500,
                marginBottom: '0.6rem',
              }}
            >
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                outline: 'none',
                marginBottom: '1rem',
              }}
              placeholder="Enter a new password"
              disabled={isSubmitting}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '1rem',
                background: isSubmitting
                  ? 'rgba(100, 100, 100, 0.5)'
                  : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}

        {hasValidAction && (mode === 'verifyEmail' || mode === 'recoverEmail') && (
          <button
            type="button"
            onClick={handleVerifyOrRecover}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: isSubmitting
                ? 'rgba(100, 100, 100, 0.5)'
                : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'verifyEmail'
                ? 'Verify My Email'
                : 'Recover My Email'}
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link
            to="/login"
            style={{
              color: 'rgba(0, 212, 255, 0.9)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthAction;
