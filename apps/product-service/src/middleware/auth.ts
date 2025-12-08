import { Request, Response, NextFunction } from 'express';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import * as dotenv from 'dotenv';

dotenv.config();

const JWKS_URL = process.env.JWKS_URL || 'http://localhost:3000/api/auth/jwks';
const JWT_ISSUER = process.env.JWT_ISSUER || 'http://localhost:3000';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'http://localhost:3000';

const JWKS = createRemoteJWKSet(new URL(JWKS_URL));

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    sessionId: string;
    [key: string]: any;
  };
}

export async function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7);

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    req.user = {
      userId: payload.sub as string,
      sessionId: payload.sessionId as string,
      roleId: payload.roleId as string,
      ...payload,
    };

    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const ADMIN_ROLE_ID = '9f28d6c7-9519-4598-b80c-783515456f43';
  if (!req.user || req.user.roleId !== ADMIN_ROLE_ID) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}
