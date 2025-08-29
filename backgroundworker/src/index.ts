import { Hono } from "hono";
import { GoogleTokenRefreshService } from "./googleTokenRefreshService";
import type { RefreshSummary } from "./types";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// 健康检查 endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "backgroundworker"
  });
});

// 手动触发 Google token 刷新的 API endpoint
app.get("/api/refresh-google-tokens", async (c) => {
  try {
    console.log('[BackgroundWorker] Manual Google token refresh triggered');
    
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET;
    if (!googleClientSecret) {
      console.error('[BackgroundWorker] Missing GOOGLE_CLIENT_SECRET environment variable');
      return c.json({
        success: false,
        error: "GOOGLE_CLIENT_SECRET not configured"
      }, 500);
    }

    const refreshService = new GoogleTokenRefreshService(
      c.env.DB,
      c.env.GOOGLE_CLIENT_ID,
      googleClientSecret
    );

    const summary = await refreshService.refreshAllExpiredTokens();
    await refreshService.cleanup();

    console.log('[BackgroundWorker] Manual refresh completed:', summary);

    return c.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BackgroundWorker] Error during manual token refresh:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// 获取需要刷新 token 的用户数量 (用于监控)
app.get("/api/refresh-status", async (c) => {
  try {
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET;
    if (!googleClientSecret) {
      return c.json({
        success: false,
        error: "GOOGLE_CLIENT_SECRET not configured"
      }, 500);
    }

    const refreshService = new GoogleTokenRefreshService(
      c.env.DB,
      c.env.GOOGLE_CLIENT_ID,
      googleClientSecret
    );

    const users = await refreshService.getUsersNeedingRefresh();
    await refreshService.cleanup();

    return c.json({
      success: true,
      usersNeedingRefresh: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        tokenExpiry: user.googleTokenExpiry?.toISOString() || null,
        hasRefreshToken: !!user.googleRefreshToken
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BackgroundWorker] Error checking refresh status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// 处理定时任务 (Scheduled Event Handler)
app.get("/scheduled", async (c) => {
  try {
    console.log('[BackgroundWorker] Scheduled Google token refresh started');
    
    const googleClientSecret = c.env.GOOGLE_CLIENT_SECRET;
    if (!googleClientSecret) {
      console.error('[BackgroundWorker] Missing GOOGLE_CLIENT_SECRET environment variable');
      return c.json({
        success: false,
        error: "GOOGLE_CLIENT_SECRET not configured"
      }, 500);
    }

    const refreshService = new GoogleTokenRefreshService(
      c.env.DB,
      c.env.GOOGLE_CLIENT_ID,
      googleClientSecret
    );

    const summary = await refreshService.refreshAllExpiredTokens();
    await refreshService.cleanup();

    console.log('[BackgroundWorker] Scheduled refresh completed:', summary);

    // 如果有失败的刷新，记录警告
    if (summary.failed > 0) {
      console.warn(`[BackgroundWorker] ${summary.failed} token refreshes failed:`, summary.errors);
    }

    return c.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[BackgroundWorker] Error during scheduled token refresh:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// 处理 Cloudflare Workers 的 scheduled event
export default {
  fetch: app.fetch,
  async scheduled(event: any, env: CloudflareBindings, ctx: any) {
    // 使用 waitUntil 确保定时任务在 worker 销毁前完成
    ctx.waitUntil(handleScheduledEvent(env));
  }
};

// 定时任务处理函数
async function handleScheduledEvent(env: CloudflareBindings): Promise<void> {
  try {
    console.log('[BackgroundWorker] Cron job triggered at', new Date().toISOString());
    
    const googleClientSecret = env.GOOGLE_CLIENT_SECRET;
    if (!googleClientSecret) {
      console.error('[BackgroundWorker] Missing GOOGLE_CLIENT_SECRET environment variable');
      return;
    }

    const refreshService = new GoogleTokenRefreshService(
      env.DB,
      env.GOOGLE_CLIENT_ID,
      googleClientSecret
    );

    const summary = await refreshService.refreshAllExpiredTokens();
    await refreshService.cleanup();

    console.log('[BackgroundWorker] Cron job completed:', summary);

    // 如果有失败的刷新，记录更多详细信息
    if (summary.failed > 0) {
      console.warn(`[BackgroundWorker] Cron job - ${summary.failed} token refreshes failed:`);
      summary.errors.forEach(error => console.warn(`  - ${error}`));
    }

  } catch (error) {
    console.error('[BackgroundWorker] Error in cron job:', error);
  }
}
