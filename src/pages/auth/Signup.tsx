import { useState, useEffect } from 'react';
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

const NATIONALITY_PHONE_RULES = {
  Egyptian: { code: '+20', localLength: 11, countryName: 'Egypt', flag: '🇪🇬' },
  Saudi: { code: '+966', localLength: 10, countryName: 'Saudi Arabia', flag: '🇸🇦' },
  Emirati: { code: '+971', localLength: 10, countryName: 'United Arab Emirates', flag: '🇦🇪' },
  Jordanian: { code: '+962', localLength: 10, countryName: 'Jordan', flag: '🇯🇴' },
  Kuwaiti: { code: '+965', localLength: 8, countryName: 'Kuwait', flag: '🇰🇼' },
  Qatari: { code: '+974', localLength: 8, countryName: 'Qatar', flag: '🇶🇦' },
  Bahraini: { code: '+973', localLength: 8, countryName: 'Bahrain', flag: '🇧🇭' },
  Omani: { code: '+968', localLength: 8, countryName: 'Oman', flag: '🇴🇲' },
  Lebanese: { code: '+961', localLength: 8, countryName: 'Lebanon', flag: '🇱🇧' },
} as const;

type SupportedNationality = keyof typeof NATIONALITY_PHONE_RULES;
type PhoneRule = {
  nationality: SupportedNationality;
  code: string;
  localLength: number;
  countryName: string;
  flag: string;
};

const hasSequentialPattern = (value: string) => {
  const lowerValue = value.toLowerCase();
  const normalized = lowerValue.replace(/[^a-z0-9]/g, '');

  for (let i = 0; i <= normalized.length - 3; i += 1) {
    const first = normalized.charCodeAt(i);
    const second = normalized.charCodeAt(i + 1);
    const third = normalized.charCodeAt(i + 2);

    if (second - first === 1 && third - second === 1) {
      return true;
    }
  }

  return false;
};

const validatePasswordStrength = (password: string) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least 1 uppercase letter';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least 1 lowercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least 1 number';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least 1 symbol';
  }

  if (hasSequentialPattern(password)) {
    return 'Password must not include sequential patterns like abc or 123';
  }

  return null;
};

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

  const gradeOptions = ['High School', 'Undergraduate', 'Postgraduate', 'Diploma', 'Other'];
  const nationalityOptions = [
    { value: 'Egyptian', label: '🇪🇬 Egyptian' },
    { value: 'Saudi', label: '🇸🇦 Saudi' },
    { value: 'Emirati', label: '🇦🇪 Emirati' },
    { value: 'Jordanian', label: '🇯🇴 Jordanian' },
    { value: 'Kuwaiti', label: '🇰🇼 Kuwaiti' },
    { value: 'Qatari', label: '🇶🇦 Qatari' },
    { value: 'Bahraini', label: '🇧🇭 Bahraini' },
    { value: 'Omani', label: '🇴🇲 Omani' },
    { value: 'Lebanese', label: '🇱🇧 Lebanese' },
    { value: 'Other', label: 'Other' },
  ];

  const { signup, user, isSigningUp } = useAuthQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPhoneCode, setSelectedPhoneCode] = useState('');

  const phoneRules: PhoneRule[] = (Object.keys(NATIONALITY_PHONE_RULES) as SupportedNationality[]).map((nationality) => ({
    nationality,
    code: NATIONALITY_PHONE_RULES[nationality].code,
    localLength: NATIONALITY_PHONE_RULES[nationality].localLength,
    countryName: NATIONALITY_PHONE_RULES[nationality].countryName,
    flag: NATIONALITY_PHONE_RULES[nationality].flag,
  }));

  // Get the return URL from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/';
  const selectedPhoneRule = selectedPhoneCode
    ? phoneRules.find((rule) => rule.code === selectedPhoneCode)
    : undefined;

  // Debug: Monitor user state changes
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === 'nationality') {
      const nextRule = NATIONALITY_PHONE_RULES[value as SupportedNationality];
      setFormData(prev => {
        const sanitizedPhone = prev.phone.replace(/\D/g, '');
        return {
          ...prev,
          nationality: value,
          phone: nextRule ? sanitizedPhone.slice(0, nextRule.localLength) : sanitizedPhone.slice(0, 15)
        };
      });
      setSelectedPhoneCode(nextRule?.code || '');

      if (errors.nationality || errors.phone) {
        setErrors(prev => ({
          ...prev,
          nationality: '',
          phone: ''
        }));
      }
      return;
    }

    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      value = selectedPhoneRule
        ? digitsOnly.slice(0, selectedPhoneRule.localLength)
        : digitsOnly.slice(0, 15);
    }

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

  const handlePhoneCodeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextCode = e.target.value;
    const nextRule = phoneRules.find((rule) => rule.code === nextCode);

    setSelectedPhoneCode(nextCode);
    setFormData((prev) => {
      const sanitizedPhone = prev.phone.replace(/\D/g, '');
      return {
        ...prev,
        nationality: nextRule ? nextRule.nationality : prev.nationality,
        phone: nextRule ? sanitizedPhone.slice(0, nextRule.localLength) : sanitizedPhone.slice(0, 15),
      };
    });

    if (errors.phone || errors.nationality) {
      setErrors((prev) => ({
        ...prev,
        phone: '',
        nationality: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Second name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordError = validatePasswordStrength(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.university.trim()) newErrors.university = 'University is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';

    const phoneDigits = formData.phone.trim();
    if (phoneDigits) {
      if (!/^\d+$/.test(phoneDigits)) {
        newErrors.phone = 'Phone number must contain digits only';
      } else if (selectedPhoneRule && phoneDigits.length !== selectedPhoneRule.localLength) {
        newErrors.phone = `Phone number must be ${selectedPhoneRule.localLength} digits for ${formData.nationality} (without country code)`;
      } else if (!selectedPhoneRule && (phoneDigits.length < 6 || phoneDigits.length > 15)) {
        newErrors.phone = 'Phone number must be between 6 and 15 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const trimmedPhone = formData.phone.trim();
      const normalizedPhone = trimmedPhone
        ? selectedPhoneCode
          ? `${selectedPhoneCode}${trimmedPhone}`
          : trimmedPhone
        : '';

      const result = await signup({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: normalizedPhone,
        grade: formData.grade,
        graduation_year: formData.graduation_year,
        nationality: formData.nationality,
        university: formData.university
      });

      if (result.success) {
        const successMessage = result.message
          || 'Account created. Check your inbox and spam folder for the verification email. If it does not arrive, use Resend verification on login.';
        navigate('/login', {
          replace: true,
          state: {
            from: location.state?.from,
            signupSuccess: successMessage,
            prefillEmail: formData.email.trim(),
            canResendVerification: true,
          },
        });
      } else {
        setErrors({ general: result.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  const inputStyle = (error?: string) => ({
    width: '100%',
    padding: '0.875rem 1rem',
    border: `2px solid ${error ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '12px',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    transition: 'all 0.3s ease',
    marginBottom: '0.5rem',
    outline: 'none'
  });

  const labelStyle = {
    display: 'block',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '0.6rem'
  };

  const requiredMarkStyle = {
    color: '#ef4444',
    marginLeft: '0.2rem'
  };

  const errorStyle = {
    color: 'var(--color-danger)',
    fontSize: '0.75rem',
    marginTop: '0',
    marginBottom: '1rem'
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #2a1f3a 100%)',
      padding: isMobile ? '1rem 0.75rem' : isTablet ? '2rem 1rem' : '3rem 1rem',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: isMobile ? '18px' : '24px',
        padding: isMobile ? '1.25rem 1rem' : isTablet ? '2rem 1.6rem' : '3rem 2.5rem',
        width: '100%',
        maxWidth: '650px',
        margin: isMobile ? '0.5rem auto' : isTablet ? '1rem auto' : '2rem auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 100px rgba(102, 126, 234, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.2rem' : '2.5rem' }}>
          <h1 style={{
            background: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.1rem' : '2.5rem',
            fontWeight: '800',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Create Account
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.95rem',
            margin: 0
          }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div>
              <label htmlFor="first_name" style={labelStyle}>First Name<span style={requiredMarkStyle}>*</span></label>
              <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} style={inputStyle(errors.first_name)} placeholder="First Name" disabled={isSigningUp} />
              {errors.first_name && <p style={errorStyle}>{errors.first_name}</p>}
            </div>
            <div>
              <label htmlFor="last_name" style={labelStyle}>Second Name<span style={requiredMarkStyle}>*</span></label>
              <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} style={inputStyle(errors.last_name)} placeholder="Second Name" disabled={isSigningUp} />
              {errors.last_name && <p style={errorStyle}>{errors.last_name}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="email" style={labelStyle}>Email Address<span style={requiredMarkStyle}>*</span></label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle(errors.email)} placeholder="Enter your email" disabled={isSigningUp} />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div>
              <label htmlFor="phone" style={labelStyle}>Phone</label>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <span style={{
                  minWidth: isMobile ? '100%' : '100px',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: 'center',
                  overflow: 'hidden'
                }}>
                  <select
                    value={selectedPhoneCode}
                    onChange={handlePhoneCodeChange}
                    style={{
                      width: '100%',
                      padding: '0.875rem 0.5rem',
                      border: `2px solid ${errors.phone ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                    disabled={isSigningUp}
                  >
                    <option value="" style={{ background: '#1a1f3a', color: 'rgba(255,255,255,0.6)' }}>
                      Code
                    </option>
                    {phoneRules.map((rule) => (
                      <option key={rule.code} value={rule.code} style={{ background: '#1a1f3a', color: '#fff' }}>
                        {`${rule.flag} ${rule.code}`}
                      </option>
                    ))}
                  </select>
                </span>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={selectedPhoneRule ? `${selectedPhoneRule.localLength} digits` : 'Phone Number'}
                  maxLength={selectedPhoneRule ? selectedPhoneRule.localLength : 15}
                  inputMode="numeric"
                  disabled={isSigningUp}
                  style={{ ...inputStyle(errors.phone), marginBottom: isMobile ? 0 : '0.5rem' }}
                />
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.75rem',
                marginTop: '0.4rem',
                marginBottom: errors.phone ? '0.4rem' : '1rem',
                lineHeight: '1.4'
              }}>
                {selectedPhoneRule
                  ? `Enter ${selectedPhoneRule.localLength} digits only. Selected code ${selectedPhoneRule.code} is added automatically.`
                  : 'Select nationality or choose a country code to apply the correct phone length.'}
              </p>
              {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="nationality" style={labelStyle}>Nationality<span style={requiredMarkStyle}>*</span></label>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                style={inputStyle(errors.nationality)}
                disabled={isSigningUp}
              >
                <option value="" style={{ background: '#1a1f3a', color: 'rgba(255,255,255,0.6)' }}>
                  Select nationality
                </option>
                {nationalityOptions.map((option) => (
                  <option key={option.value} value={option.value} style={{ background: '#1a1f3a', color: '#fff' }}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.nationality && <p style={errorStyle}>{errors.nationality}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div>
              <label htmlFor="grade" style={labelStyle}>Grade<span style={requiredMarkStyle}>*</span></label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                style={inputStyle(errors.grade)}
                disabled={isSigningUp}
              >
                <option value="" style={{ background: '#1a1f3a', color: 'rgba(255,255,255,0.6)' }}>
                  Select grade
                </option>
                {gradeOptions.map((option) => (
                  <option key={option} value={option} style={{ background: '#1a1f3a', color: '#fff' }}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.grade && <p style={errorStyle}>{errors.grade}</p>}
            </div>
            <div>
              <label htmlFor="graduation_year" style={labelStyle}>Graduation Year</label>
              <input
                type="date"
                id="graduation_year"
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                style={inputStyle(errors.graduation_year)}
                disabled={isSigningUp}
              />
              {errors.graduation_year && <p style={errorStyle}>{errors.graduation_year}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="university" style={labelStyle}>University<span style={requiredMarkStyle}>*</span></label>
            <input type="text" id="university" name="university" value={formData.university} onChange={handleChange} style={inputStyle(errors.university)} placeholder="University Name" disabled={isSigningUp} />
            {errors.university && <p style={errorStyle}>{errors.university}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div>
              <label htmlFor="password" style={labelStyle}>Password<span style={requiredMarkStyle}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ ...inputStyle(errors.password), paddingRight: '3rem' }}
                  placeholder="Create a password"
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: 'calc(50% - 2px)',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                  disabled={isSigningUp}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.75rem',
                marginTop: '0',
                marginBottom: errors.password ? '0.5rem' : '1rem',
                lineHeight: '1.4'
              }}>
                Must be 8+ characters, include uppercase and lowercase letters, a number, a symbol, and no sequences like abc or 123.
              </p>
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password<span style={requiredMarkStyle}>*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ ...inputStyle(errors.confirmPassword), paddingRight: '3rem' }}
                  placeholder="Confirm password"
                  disabled={isSigningUp}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: 'calc(50% - 2px)',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                  disabled={isSigningUp}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            style={{
              width: '100%',
              padding: isMobile ? '0.9rem' : '1rem',
              background: isSigningUp ? 'rgba(100, 100, 100, 0.5)' : 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: isMobile ? '0.98rem' : '1.05rem',
              fontWeight: '700',
              cursor: isSigningUp ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: isMobile ? '0.6rem' : '1rem',
              marginBottom: '1.5rem',
              boxShadow: isSigningUp ? 'none' : '0 8px 20px rgba(0, 212, 255, 0.3)',
              textTransform: 'none',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => !isSigningUp && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 212, 255, 0.4)')}
            onMouseLeave={(e) => !isSigningUp && (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 212, 255, 0.3)')}
          >
            {isSigningUp ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '0.9rem',
            marginBottom: '0'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textDecoration: 'none',
              fontWeight: '700'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;