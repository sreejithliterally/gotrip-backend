import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../types';

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
