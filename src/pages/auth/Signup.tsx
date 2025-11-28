import React, { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthQuery } from '../../hooks/useAuthQuery';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  grade: string;
  graduation_year: string;
  nationality: string;
  university: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  grade?: string;
  graduation_year?: string;
  nationality?: string;
  university?: string;
  general?: string;
}

const Signup = () => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    grade: '',
    graduation_year: '',
    nationality: '',
    university: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const { signup, user, isSigningUp } = useAuthQuery();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the return URL from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/';

  // Debug: Monitor user state changes
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.graduation_year) newErrors.graduation_year = 'Graduation year is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.university) newErrors.university = 'University is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        grade: formData.grade,
        graduation_year: formData.graduation_year,
        nationality: formData.nationality,
        university: formData.university
      });

      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const inputStyle = (error?: string) => ({
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'} `,
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    transition: 'border-color 0.2s ease',
    marginBottom: '0.5rem'
  });

  const labelStyle = {
    display: 'block',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem'
  };

  const errorStyle = {
    color: 'var(--color-danger)',
    fontSize: '0.75rem',
    marginTop: '0',
    marginBottom: '1rem'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg-secondary)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--color-text)', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            Join Quizzy and start your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={{
              background: 'var(--color-danger)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {errors.general}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="first_name" style={labelStyle}>First Name</label>
              <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle(errors.first_name)} placeholder="First Name" disabled={isSigningUp} />
              {errors.first_name && <p style={errorStyle}>{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="last_name" style={labelStyle}>Last Name</label>
              <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle(errors.last_name)} placeholder="Last Name" disabled={isSigningUp} />
              {errors.last_name && <p style={errorStyle}>{errors.last_name}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle(errors.email)} placeholder="Enter your email" disabled={isSigningUp} />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="phone" style={labelStyle}>Phone</label>
              <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle(errors.phone)} placeholder="Phone Number" disabled={isSigningUp} />
              {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="nationality" style={labelStyle}>Nationality</label>
              <input type="text" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} style={inputStyle(errors.nationality)} placeholder="Nationality" disabled={isSigningUp} />
              {errors.nationality && <p style={errorStyle}>{errors.nationality}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="grade" style={labelStyle}>Grade</label>
              <input type="text" id="grade" name="grade" value={formData.grade} onChange={handleChange} style={inputStyle(errors.grade)} placeholder="Grade" disabled={isSigningUp} />
              {errors.grade && <p style={errorStyle}>{errors.grade}</p>}
            </div>
            <div>
              <label htmlFor="graduation_year" style={labelStyle}>Graduation Year</label>
              <input type="text" id="graduation_year" name="graduation_year" value={formData.graduation_year} onChange={handleChange} style={inputStyle(errors.graduation_year)} placeholder="Year" disabled={isSigningUp} />
              {errors.graduation_year && <p style={errorStyle}>{errors.graduation_year}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="university" style={labelStyle}>University</label>
            <input type="text" id="university" name="university" value={formData.university} onChange={handleChange} style={inputStyle(errors.university)} placeholder="University Name" disabled={isSigningUp} />
            {errors.university && <p style={errorStyle}>{errors.university}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="password" style={labelStyle}>Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle(errors.password)} placeholder="Create a password" disabled={isSigningUp} />
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} style={inputStyle(errors.confirmPassword)} placeholder="Confirm password" disabled={isSigningUp} />
              {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: isSigningUp ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isSigningUp ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              marginTop: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            {isSigningUp ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;