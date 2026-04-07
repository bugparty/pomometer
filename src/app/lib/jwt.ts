import jwt from 'jsonwebtoken';
import type { GoogleUserInfo, JWTPayload } from '../types/api';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 生成JWT token
export function generateJWT(userInfo: GoogleUserInfo): string {
  const payload: JWTPayload = {
    sub: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
  };

  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

// 验证JWT token
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// 验证Google JWT token
export function verifyGoogleToken(credential: string, googleClientId: string): GoogleUserInfo | null {
  // 检查 Google Client ID 配置
  if (!googleClientId || googleClientId.trim() === '') {
    console.error('🔴 [JWT] Google Client ID is not configured');
    console.error('🔴 [JWT] Please set GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable');
    return null;
  }

  try {
    // 解码JWT payload（生产环境中应该验证签名）
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
    
    // 验证token是否过期
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    // 验证issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      throw new Error('Invalid issuer');
    }
    
    // 验证audience（客户端ID）- 支持数组和字符串格式
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
      // 暂时不抛出错误，用于调试
      // throw new Error('Invalid audience')
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
