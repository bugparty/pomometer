import type {
  GoogleTokenResponse,
  GoogleTokenRefreshRequest,
  UserWithTokens,
  TokenRefreshResult,
  RefreshSummary
} from './types';

// 直接使用 D1 而不是 Prisma，避免 Workers 打包解析 @prisma/client 的问题
export class GoogleTokenRefreshService {
  private db: D1Database;
  private googleClientId: string;
  private googleClientSecret: string;

  constructor(d1Database: D1Database, googleClientId: string, googleClientSecret: string) {
    this.db = d1Database;
    this.googleClientId = googleClientId;
    this.googleClientSecret = googleClientSecret;
  }

  /**
   * 获取所有需要刷新 token 的用户
   * 条件：有 refresh_token 且 access_token 在 30 分钟内过期
   */
  async getUsersNeedingRefresh(): Promise<UserWithTokens[]> {
    const threshold = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
    // SQLite (D1) 中日期以 ISO 字符串存储，比较时直接字符串比较即可（>= ISO 顺序一致）
    const thresholdIso = threshold.toISOString();
    const stmt = await this.db.prepare(
      `SELECT id, email, name, google_access_token as googleAccessToken, google_refresh_token as googleRefreshToken, google_token_expiry as googleTokenExpiry
       FROM users
       WHERE google_refresh_token IS NOT NULL
         AND (google_token_expiry IS NULL OR google_token_expiry <= ?)`
    ).bind(thresholdIso);
    const { results } = await stmt.all<any>();
    return (results || []).map(r => ({
      id: r.id,
      email: r.email,
      name: r.name ?? null,
      googleAccessToken: r.googleAccessToken ?? null,
      googleRefreshToken: r.googleRefreshToken ?? null,
      googleTokenExpiry: r.googleTokenExpiry ? new Date(r.googleTokenExpiry) : null
    }));
  }

  /**
   * 刷新单个用户的 Google Access Token
   */
  async refreshUserToken(user: UserWithTokens): Promise<TokenRefreshResult> {
    const result: TokenRefreshResult = {
      userId: user.id,
      success: false
    };

    try {
      if (!user.googleRefreshToken) {
        result.error = 'No refresh token available';
        return result;
      }

      // 构建刷新请求参数
      const refreshParams: GoogleTokenRefreshRequest = {
        refresh_token: user.googleRefreshToken,
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        grant_type: 'refresh_token'
      };

      console.log(`[TokenRefresh] Refreshing token for user ${user.id} (${user.email})`);

      // 向 Google 发送刷新请求
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(refreshParams as any),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TokenRefresh] Failed to refresh token for user ${user.id}:`, errorText);
        result.error = `Google API error: ${response.status} ${response.statusText}`;
        return result;
      }

      const tokenData = await response.json() as GoogleTokenResponse;

      // 计算新的过期时间
      const newTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      // 更新数据库中的 token 信息
      // 更新数据库
      const updateStmt = await this.db.prepare(
        `UPDATE users
         SET google_access_token = ?,
             google_refresh_token = COALESCE(?, google_refresh_token),
             google_token_expiry = ?,
             updated_at = ?
         WHERE id = ?`
      ).bind(
        tokenData.access_token,
        tokenData.refresh_token || null,
        newTokenExpiry.toISOString(),
        new Date().toISOString(),
        user.id
      );
      await updateStmt.run();

      console.log(`[TokenRefresh] Successfully refreshed token for user ${user.id}, expires at ${newTokenExpiry.toISOString()}`);
      
      result.success = true;
      result.newTokenExpiry = newTokenExpiry;
      
    } catch (error) {
      console.error(`[TokenRefresh] Error refreshing token for user ${user.id}:`, error);
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  /**
   * 批量刷新所有需要刷新的用户 token
   */
  async refreshAllExpiredTokens(): Promise<RefreshSummary> {
    const summary: RefreshSummary = {
      totalUsers: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log('[TokenRefresh] Starting batch token refresh...');
      
      const users = await this.getUsersNeedingRefresh();
      summary.totalUsers = users.length;

      if (users.length === 0) {
        console.log('[TokenRefresh] No users need token refresh at this time');
        return summary;
      }

      console.log(`[TokenRefresh] Found ${users.length} users needing token refresh`);

      // 逐个处理用户（避免并发过多导致 Google API 限流）
      for (const user of users) {
        summary.processed++;
        
        const result = await this.refreshUserToken(user);
        
        if (result.success) {
          summary.successful++;
        } else {
          summary.failed++;
          const errorMsg = `User ${user.id} (${user.email}): ${result.error}`;
          summary.errors.push(errorMsg);
          console.error(`[TokenRefresh] ${errorMsg}`);
        }

        // 在请求之间添加小延迟，避免触发 Google API 限流
        if (summary.processed < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`[TokenRefresh] Batch refresh completed: ${summary.successful} successful, ${summary.failed} failed`);

    } catch (error) {
      console.error('[TokenRefresh] Error during batch refresh:', error);
      summary.errors.push(`Batch process error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return summary;
  }

  /**
   * 清理数据库连接
   */
  async cleanup() {
    // D1 无需显式断开
  }
}
