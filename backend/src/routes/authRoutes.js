import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const firebaseBaseUrl = 'https://identitytoolkit.googleapis.com/v1';
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nationalityPhoneRules = {
  Egyptian: { code: '+20', localLength: 11 },
  Saudi: { code: '+966', localLength: 10 },
  Emirati: { code: '+971', localLength: 10 },
  Jordanian: { code: '+962', localLength: 10 },
  Kuwaiti: { code: '+965', localLength: 8 },
  Qatari: { code: '+974', localLength: 8 },
  Bahraini: { code: '+973', localLength: 8 },
  Omani: { code: '+968', localLength: 8 },
  Lebanese: { code: '+961', localLength: 8 },
};

function firebaseUrl(endpoint) {
  return `${firebaseBaseUrl}/${endpoint}?key=${env.firebaseApiKey}`;
}

function mapFirebaseError(message = '') {
  const normalized = String(message).toUpperCase();

  if (normalized.includes('INVALID_API_KEY') || normalized.includes('API_KEY_INVALID')) {
    return 'Firebase API key is invalid. Check FIREBASE_API_KEY in backend/.env.';
  }
  if (normalized.includes('PROJECT_NOT_FOUND')) {
    return 'Firebase project not found. Verify your API key and project configuration.';
  }
  if (normalized.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Email/password sign-in is not configured in Firebase Authentication.';
  }
  if (normalized.includes('EMAIL_EXISTS')) return 'Email already exists.';
  if (normalized.includes('INVALID_PASSWORD')) return 'Invalid email or password.';
  if (normalized.includes('INVALID_LOGIN_CREDENTIALS')) return 'Invalid email or password.';
  if (normalized.includes('EMAIL_NOT_FOUND')) return 'Invalid email or password.';
  if (normalized.includes('USER_DISABLED')) return 'This account has been disabled.';
  if (normalized.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
    return 'Too many attempts. Please try again later.';
  }
  if (normalized.includes('OPERATION_NOT_ALLOWED')) {
    return 'Email/password sign-in is not enabled in Firebase Authentication.';
  }
  if (normalized.includes('WEAK_PASSWORD')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  if (normalized.includes('INVALID_OOB_CODE')) {
    return 'This action link is invalid. Please request a new one.';
  }
  if (normalized.includes('EXPIRED_OOB_CODE')) {
    return 'This action link has expired. Please request a new one.';
  }
  if (normalized.includes('MISSING_OOB_CODE')) {
    return 'Action code is missing from the link.';
  }

  return message || 'Authentication failed. Please try again.';
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return emailRegex.test(normalizeEmail(value));
}

function normalizeGraduationYear(value) {
  if (!value) return null;

  const raw = String(value).trim();
  const yearMatches = raw.match(/(19|20)\d{2}/g);

  if (yearMatches && yearMatches.length > 0) {
    return yearMatches[yearMatches.length - 1];
  }

  return raw.slice(0, 4) || null;
}

function hasSequentialPattern(value) {
  const normalized = String(value).toLowerCase().replace(/[^a-z0-9]/g, '');

  for (let i = 0; i <= normalized.length - 3; i += 1) {
    const first = normalized.charCodeAt(i);
    const second = normalized.charCodeAt(i + 1);
    const third = normalized.charCodeAt(i + 2);

    if (second - first === 1 && third - second === 1) {
      return true;
    }
  }

  return false;
}

function validateStrongPassword(password) {
  const value = String(password || '');

  if (value.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least 1 uppercase letter.';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least 1 lowercase letter.';
  }
  if (!/\d/.test(value)) {
    return 'Password must contain at least 1 number.';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must contain at least 1 symbol.';
  }
  if (hasSequentialPattern(value)) {
    return 'Password must not include sequential patterns like abc or 123.';
  }

  return null;
}

function normalizeAndValidatePhone(phone, nationality) {
  const rawPhone = String(phone || '').trim();
  if (!rawPhone) return { valid: true, normalizedPhone: null };

  const digitsOnly = rawPhone.replace(/\D/g, '');
  const rule = nationalityPhoneRules[String(nationality || '').trim()];

  if (rule) {
    const countryCodeDigits = rule.code.replace('+', '');
    let localDigits = digitsOnly;

    if (localDigits.startsWith(countryCodeDigits)) {
      localDigits = localDigits.slice(countryCodeDigits.length);
    }

    if (localDigits.length !== rule.localLength) {
      return {
        valid: false,
        message: `Phone number must be ${rule.localLength} digits for ${nationality} (without country code).`,
      };
    }

    return {
      valid: true,
      normalizedPhone: `${rule.code}${localDigits}`,
    };
  }

  if (digitsOnly.length < 6 || digitsOnly.length > 15) {
    return {
      valid: false,
      message: 'Phone number must be between 6 and 15 digits.',
    };
  }

  return {
    valid: true,
    normalizedPhone: `+${digitsOnly}`,
  };
}

async function postFirebase(endpoint, payload) {
  const response = await fetch(firebaseUrl(endpoint), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMessage = data?.error?.message || 'Firebase request failed';
    throw new Error(errorMessage);
  }

  return data;
}

async function postFirebaseSafe(endpoint, payload) {
  try {
    const data = await postFirebase(endpoint, payload);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, message: String(error?.message || 'Firebase request failed') };
  }
}

router.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      grade,
      graduation_year,
      nationality,
      university,
    } = req.body;

    if (!String(first_name || '').trim()) {
      return res.status(400).json({ success: false, message: 'First name is required.' });
    }

    if (!String(last_name || '').trim()) {
      return res.status(400).json({ success: false, message: 'Second name is required.' });
    }

    if (!String(email || '').trim()) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (!String(university || '').trim()) {
      return res.status(400).json({ success: false, message: 'University is required.' });
    }

    if (!String(grade || '').trim()) {
      return res.status(400).json({ success: false, message: 'Grade is required.' });
    }

    if (!String(nationality || '').trim()) {
      return res.status(400).json({ success: false, message: 'Nationality is required.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const passwordValidationMessage = validateStrongPassword(password);
    if (passwordValidationMessage) {
      return res.status(400).json({ success: false, message: passwordValidationMessage });
    }

    const normalizedEmailInput = normalizeEmail(email);

    const signUpData = await postFirebase('accounts:signUp', {
      email: normalizedEmailInput,
      password,
      returnSecureToken: true,
    });

    if (!signUpData?.idToken || !signUpData?.email) {
      return res.status(400).json({ success: false, message: 'Signup failed. Please try again.' });
    }

    const displayName = [String(first_name || '').trim(), String(last_name || '').trim()]
      .filter(Boolean)
      .join(' ')
      .trim();

    if (displayName) {
      await postFirebase('accounts:update', {
        idToken: signUpData.idToken,
        displayName,
        returnSecureToken: true,
      });
    }

    await postFirebase('accounts:sendOobCode', {
      requestType: 'VERIFY_EMAIL',
      idToken: signUpData.idToken,
    });

    const normalizedEmail = String(signUpData.email).toLowerCase();
    const passwordHash = await bcrypt.hash(`firebase-${signUpData.localId}`, 10);
    const normalizedGraduationYear = normalizeGraduationYear(graduation_year);
    const phoneValidation = normalizeAndValidatePhone(phone, nationality);

    if (!phoneValidation.valid) {
      return res.status(400).json({ success: false, message: phoneValidation.message });
    }

    try {
      await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, grade, graduation_year, nationality, university)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (email)
         DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = EXCLUDED.phone,
           grade = EXCLUDED.grade,
           graduation_year = EXCLUDED.graduation_year,
           nationality = EXCLUDED.nationality,
           university = EXCLUDED.university`,
        [
          first_name || 'User',
          last_name || '',
          normalizedEmail,
          passwordHash,
          phoneValidation.normalizedPhone,
          grade || null,
          normalizedGraduationYear,
          nationality || null,
          university || null,
        ]
      );
    } catch (dbError) {
      console.error('Local user profile upsert failed after Firebase signup:', dbError);
    }

    return res.json({
      success: true,
      message: 'Account created. Please check your email and verify your account before logging in.',
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: mapFirebaseError(error?.message),
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const signInData = await postFirebase('accounts:signInWithPassword', {
      email: normalizeEmail(email),
      password,
      returnSecureToken: true,
    });

    if (!signInData?.idToken || !signInData?.email) {
      return res.status(400).json({ success: false, message: 'Unable to read authenticated user.' });
    }

    const accountInfo = await postFirebase('accounts:lookup', {
      idToken: signInData.idToken,
    });

    const firebaseUser = accountInfo?.users?.[0];
    if (!firebaseUser?.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    const normalizedEmail = String(signInData.email).toLowerCase();
    const displayName = firebaseUser.displayName || '';
    const [firstName = 'User', ...rest] = displayName.split(' ');
    const lastName = rest.join(' ') || '';

    let userResult = await pool.query(
      `SELECT id, first_name, last_name, email, phone, grade, graduation_year, nationality, university, profile_image
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      const password_hash = await bcrypt.hash(`firebase-${signInData.localId}`, 10);
      userResult = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, first_name, last_name, email, phone, grade, graduation_year, nationality, university, profile_image`,
        [firstName, lastName, normalizedEmail, password_hash]
      );
    }

    const user = userResult.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, env.jwtSecret, { expiresIn: '1d' });

    return res.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: mapFirebaseError(error?.message),
    });
  }
});

router.post('/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const resetResult = await postFirebaseSafe('accounts:sendOobCode', {
      requestType: 'PASSWORD_RESET',
      email: normalizeEmail(email),
    });

    if (!resetResult.ok) {
      console.warn('Password reset request failed silently to avoid user enumeration.');
    }

    return res.json({
      success: true,
      message: 'If the email is registered, a password reset link has been sent.',
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: true,
      message: 'If the email is registered, a password reset link has been sent.',
    });
  }
});

router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;

    if (!oobCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Recovery code and new password are required.',
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    await postFirebase('accounts:resetPassword', {
      oobCode,
      newPassword,
    });

    return res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: mapFirebaseError(error?.message),
    });
  }
});

router.post('/email-verification/resend', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required to resend verification.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const signInData = await postFirebase('accounts:signInWithPassword', {
      email: normalizeEmail(email),
      password,
      returnSecureToken: true,
    });

    const normalizedEmail = String(signInData.email || email).trim().toLowerCase();

    await postFirebase('accounts:sendOobCode', {
      requestType: 'VERIFY_EMAIL',
      idToken: signInData.idToken,
    });

    return res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: mapFirebaseError(error?.message),
    });
  }
});

router.post('/action/apply', async (req, res) => {
  try {
    const { mode, oobCode } = req.body;

    if (!mode || !oobCode) {
      return res.status(400).json({
        success: false,
        message: 'Action mode and code are required.',
      });
    }

    const normalizedMode = String(mode).trim();

    if (normalizedMode === 'verifyEmail') {
      await postFirebase('accounts:update', { oobCode });
      return res.json({ success: true, message: 'Email verified successfully.' });
    }

    if (normalizedMode === 'recoverEmail') {
      const recoverAttempt = await postFirebaseSafe('accounts:resetPassword', { oobCode });

      if (!recoverAttempt.ok) {
        return res.status(400).json({
          success: false,
          message: mapFirebaseError(recoverAttempt.message),
        });
      }

      return res.json({ success: true, message: 'Email address recovery completed.' });
    }

    return res.status(400).json({
      success: false,
      message: 'Unsupported action mode.',
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: mapFirebaseError(error?.message),
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, first_name, last_name, email, phone, grade, graduation_year, nationality, university, profile_image FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user: userResult.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
