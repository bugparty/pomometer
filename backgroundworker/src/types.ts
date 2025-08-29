// Background worker 相关的类型定义

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface GoogleTokenRefreshRequest {
  refresh_token: string;
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
}

export interface UserWithTokens {
  id: string;
  email: string;
  name: string | null;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  googleTokenExpiry: Date | null;
}

export interface TokenRefreshResult {
  userId: string;
  success: boolean;
  error?: string;
  newTokenExpiry?: Date;
}

export interface RefreshSummary {
  totalUsers: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}
