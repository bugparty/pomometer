import type { PrismaConfig } from 'prisma';
import { PrismaD1 } from '@prisma/adapter-d1';

// Note: Environment variables should be loaded by the runtime environment
// For CI/CD, set them via GitHub Secrets or other environment configuration
// For local development, use .env files loaded by your application

export default {
	experimental: {
		adapter: true,
	},
	schema: 'prisma/schema.prisma',
	// you need to comment out the following line if you want to use prisma migrate diff
	// a reference command for local d1 database:
	// npx prisma migrate diff --from-local-d1 --to-schema-datamodel ./prisma/schema.prisma --script --output migrations/0002_add_google_token.sql
	// Note: prisma db push doesn't support local d1 database
	async adapter() {
		return new PrismaD1({
			CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN || '',
			CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '17ad48740eef0cc8f607145995815f37',
			CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID || '180ffddf-20d7-479d-beee-31942692a885',
		});
	},
} satisfies PrismaConfig;