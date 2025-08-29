import type { PrismaConfig } from 'prisma';
import { PrismaD1 } from '@prisma/adapter-d1';
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载环境变量，优先读取.env.local，然后.env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

export default {
	experimental: {
		adapter: true,
	},
	schema: 'prisma/schema.prisma',
	// you need to comment out the following line if you want to use prisma migrate diff
	// a reference command for local d1 database
	// prisma db push doesn't support local d1 database
	// npx prisma migrate diff  --from-local-d1  --to-schema-datamodel ./prisma/schema.prisma  --script --output migrations/0002_add_google_token.sql
	// 
	async adapter() {
		return new PrismaD1({
			CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN || '',
			CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '17ad48740eef0cc8f607145995815f37',
			CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID || '180ffddf-20d7-479d-beee-31942692a885',
		});
	},
} satisfies PrismaConfig;