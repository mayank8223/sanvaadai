import { defineConfig } from 'drizzle-kit';

/* ----------------- Constants --------------- */
const databaseUrl = process.env.DATABASE_URL ?? '';

/**
 * Drizzle Kit config for schema and migrations.
 *
 * IMPORTANT: Use the Supabase Connection pooler URL (port 6543), not the direct
 * connection (port 5432). Direct connections often time out (CONNECT_TIMEOUT)
 * from local/CI. In Supabase: Project Settings → Database → Connection string
 * → choose "Connection pooler" / "Transaction" or "Session" mode → copy the URI.
 */
export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
