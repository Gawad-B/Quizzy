import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authenticateToken(req, res, next) {
  const authHeader = String(req.headers.authorization || '');
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
    });

    if (!payload || typeof payload !== 'object' || !payload.id) {
      return res.status(401).json({ message: 'Token payload is invalid' });
    }

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}
