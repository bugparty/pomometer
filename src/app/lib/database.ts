import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

async function createPrismaClient(): Promise<PrismaClient> {
  try {
    const { env } = (await getCloudflareContext({ async: true })) as {
      env: CloudflareEnv;
    };
    const d1Database = env.DB;
    if (!d1Database) {
      throw new Error(
        "D1 database not found in environment. Make sure DB binding is configured in wrangler.toml",
      );
    }
    const adapter = new PrismaD1(d1Database);
    return new PrismaClient({ adapter });
  } catch (error) {
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

let prismaSingleton: Promise<PrismaClient> | null = null;

/**
 * Resolves D1 via async Cloudflare context (Wrangler getPlatformProxy in Node), so local
 * `next dev` / `next start` can connect. Sync getCloudflareContext() often fails outside the Worker.
 */
export async function getDb(): Promise<PrismaClient> {
  if (!prismaSingleton) {
    prismaSingleton = createPrismaClient();
  }
  return prismaSingleton;
}

export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    await getDb();
    return true;
  } catch {
    return false;
  }
}
