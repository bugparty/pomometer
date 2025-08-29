import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { cache } from "react";

// 获取数据库客户端 - 用于动态路由
export const getDb = cache(() => {
  try {
    const { env } = getCloudflareContext() as { env: CloudflareEnv };
    // 从Cloudflare环境变量获取D1数据库绑定
    const d1Database = env.DB;
    if (!d1Database) {
      throw new Error('D1 database not found in environment. Make sure DB binding is configured in wrangler.toml');
    }
    const adapter = new PrismaD1(d1Database);
    return new PrismaClient({ adapter });
  } catch (error) {
    // 在开发环境中，如果没有Cloudflare上下文，抛出错误
    // 因为我们需要D1数据库来工作
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// 获取数据库客户端 - 用于静态路由 (ISR/SSG)
export const getDbAsync = async () => {
  try {
    const { env } = await getCloudflareContext({ async: true }) as { env: CloudflareEnv };
    const d1Database = env.DB;
    if (!d1Database) {
      throw new Error('D1 database not found in environment. Make sure DB binding is configured in wrangler.toml');
    }
    const adapter = new PrismaD1(d1Database);
    return new PrismaClient({ adapter });
  } catch (error) {
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 检查数据库是否已初始化
export function isDatabaseInitialized(): boolean {
  try {
    getDb();
    return true;
  } catch {
    return false;
  }
}
