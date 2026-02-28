# T1 – Core Infrastructure Checklist

**Task:** Choose and provision core infrastructure so the app can connect to Supabase (DB, Auth, optional Storage) and AI services.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** None

This project uses **Supabase** for database, auth, and (optionally) object storage. One Supabase project covers sections 2, 3, and 4 below.

---

## 1. Cloud hosting (web + API)

- [ ] Create a Vercel project (or alternative: Railway, Render, etc.).
- [ ] Connect the project to your Git repo for automatic deployments.
- [ ] Note the deployment URL for later (e.g. `https://your-app.vercel.app`).

**Env var used later:** `NEXT_PUBLIC_APP_URL` (optional, for absolute URLs in emails/links).

---

## 2. Supabase project (Database + Auth + optional Storage)

- [ ] Create a [Supabase](https://supabase.com) project.
- [ ] **Database:** In Project Settings → Database, copy the **connection string** (URI format). Use the "Transaction" pooler if you use Prisma with connection pooling, or the direct connection string for migrations.
- [ ] **Auth:** In Project Settings → API, note:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon (public) key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** (server-only, keep secret) → `SUPABASE_SERVICE_ROLE_KEY` for admin operations if needed.
- [ ] Enable **Email** (and optionally **Magic Link** or social providers) under Authentication → Providers.
- [ ] **Storage (optional):** Use Supabase Storage for media uploads, or skip and use S3/R2 later. If using Supabase Storage, create a bucket when implementing uploads; same project URL and keys apply.

**Env vars:**

| Variable                        | Description                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| `DATABASE_URL`                  | Postgres connection string from Supabase (Settings → Database) |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key                                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only; for admin or RLS bypass when needed               |

---

## 3. Object storage (if not using Supabase Storage)

- [ ] If you prefer S3-compatible storage: create a bucket (e.g. AWS S3, Cloudflare R2) and obtain access key ID and secret.

**Env vars (only if not using Supabase Storage):**

- `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

---

## 4. LLM provider & API keys

- [ ] Obtain API access to an LLM (e.g. [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com)).
- [ ] Create an API key and store it securely.

**Env vars:**

- `OPENAI_API_KEY` (if using OpenAI), or
- `ANTHROPIC_API_KEY` (if using Anthropic), etc.  
  (Vercel AI SDK will use these per provider.)

---

## 5. Speech-to-Text provider

- [ ] Obtain STT API access (e.g. [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text), [Google Speech-to-Text](https://cloud.google.com/speech-to-text)).
- [ ] Create credentials if required.

**Env vars:**

- `OPENAI_API_KEY` (reused if using Whisper), or
- Google: `GOOGLE_APPLICATION_CREDENTIALS` / service account JSON path.

---

## 6. Maps provider (optional but recommended)

- [ ] Get an API key for maps (e.g. [Google Maps](https://console.cloud.google.com), [Mapbox](https://www.mapbox.com)).
- [ ] Restrict key to your domain/app if possible.

**Env var:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

---

## 7. Mobile platform accounts (for later distribution)

- [ ] Apple Developer account (for iOS).
- [ ] Google Play Console account (for Android).

_(Not required for local development; needed when distributing the collector app.)_

---

## After provisioning

1. Copy `.env.example` to `.env.local` and fill in the values you obtained from Supabase and other providers.
2. Never commit `.env` or `.env.local`; only `.env.example` (with placeholders) is in the repo.
3. In Vercel (or your host), add the same variables in the project **Environment Variables** for production/preview.

---

## Unlocks

- Ability to connect the app to **Supabase** (tables via Prisma, Auth on web and mobile) and AI services in later tasks (T4, T8, T10, T12, T27, T28, etc.).
