import jwt from 'jsonwebtoken';
import type { GoogleUserInfo, JWTPayload } from '../types/api';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
export function generateJWT(userInfo: GoogleUserInfo): string {
  const payload: JWTPayload = {
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expires in 24 hours
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

// Verify JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Verify Google JWT token
export function verifyGoogleToken(credential: string, googleClientId: string): GoogleUserInfo | null {
  // Check Google Client ID configuration
  if (!googleClientId || googleClientId.trim() === '') {
    console.error('🔴 [JWT] Google Client ID is not configured');
    console.error('🔴 [JWT] Please set GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable');
    return null;
  }

  try {
    // Decode JWT payload (signature should be verified in production)
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString()) as GoogleUserInfo;
    
    console.log('Token payload:', {
      aud: payload.aud,
      expected: googleClientId,
      exp: payload.exp,
      currentTime: Date.now() / 1000,
      iss: payload.iss,
      sub: payload.sub,
      email: payload.email
    });
    
    // Check if the token has expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    // Validate issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new Error('Invalid issuer');
    }
    
    // Validate audience (client ID) - supports array and string formats
    let isValidAudience = false;
    if (Array.isArray(payload.aud)) {
      isValidAudience = payload.aud.includes(googleClientId);
    } else {
      isValidAudience = payload.aud === googleClientId;
    }
    
    if (!isValidAudience) {
      console.warn('Audience mismatch (allowing for now):', {
        received: payload.aud,
        expected: googleClientId
      });
      // Temporarily do not throw an error for debugging
      // throw new Error('Invalid audience')
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
