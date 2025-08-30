import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { cache } from "react";

// Get database client - for dynamic routes
export const getDb = cache(() => {
  try {
    const { env } = getCloudflareContext() as { env: CloudflareEnv };
    // Retrieve the D1 database binding from Cloudflare environment variables
    const d1Database = env.DB;
    if (!d1Database) {
      throw new Error('D1 database not found in environment. Make sure DB binding is configured in wrangler.toml');
    }
    const adapter = new PrismaD1(d1Database);
    return new PrismaClient({ adapter });
  } catch (error) {
    // In development, throw an error if the Cloudflare context is missing
    // because the D1 database is required to operate
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// Get database client - for static routes (ISR/SSG)
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

// Check if the database has been initialized
export function isDatabaseInitialized(): boolean {
  try {
    getDb();
    return true;
  } catch {
    return false;
  }
}
