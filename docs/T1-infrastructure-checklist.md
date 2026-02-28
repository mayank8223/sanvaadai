# T1 – Core Infrastructure Checklist

**Task:** Choose and provision core infrastructure so the app can connect to real DB, storage, auth, and AI services.

**Complexity:** Medium · **Priority:** P0 · **Dependencies:** None

---

## 1. Cloud hosting (web + API)

- [ ] Create a Vercel project (or alternative: Railway, Render, etc.).
- [ ] Connect the project to your Git repo for automatic deployments.
- [ ] Note the deployment URL for later (e.g. `https://your-app.vercel.app`).

**Env var used later:** `NEXT_PUBLIC_APP_URL` (optional, for absolute URLs in emails/links).

---

## 2. Managed PostgreSQL database

- [ ] Create a Postgres instance (e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app), or AWS RDS).
- [ ] Copy the **connection string** (with user, password, host, port, database name).

**Env var:** `DATABASE_URL`  
Example: `postgresql://user:password@host:5432/dbname?sslmode=require`

---

## 3. Object storage for media files

- [ ] Create a bucket (e.g. AWS S3, Cloudflare R2, or [Supabase Storage](https://supabase.com/docs/guides/storage)).
- [ ] Obtain access key ID and secret (or project URL + anon key for Supabase).

**Env vars (adjust per provider):**

- `S3_BUCKET` or `STORAGE_BUCKET`
- `S3_REGION` or `STORAGE_REGION`
- `S3_ACCESS_KEY_ID` or provider-specific
- `S3_SECRET_ACCESS_KEY` or provider-specific  
Or for Supabase Storage: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase for storage + auth).

---

## 4. Auth provider

- [ ] Set up an auth tenant (e.g. [Supabase Auth](https://supabase.com/docs/guides/auth), [Clerk](https://clerk.com), or [Auth0](https://auth0.com)).
- [ ] Configure email/password (and optionally social logins).
- [ ] Copy API keys / client ID and secret.

**Env vars (example for Supabase Auth):**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
(If using Clerk or Auth0, use their documented env var names.)

---

## 5. LLM provider & API keys

- [ ] Obtain API access to an LLM (e.g. [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com)).
- [ ] Create an API key and store it securely.

**Env vars:**

- `OPENAI_API_KEY` (if using OpenAI), or  
- `ANTHROPIC_API_KEY` (if using Anthropic), etc.  
(Vercel AI SDK will use these per provider.)

---

## 6. Speech-to-Text provider

- [ ] Obtain STT API access (e.g. [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text), [Google Speech-to-Text](https://cloud.google.com/speech-to-text)).
- [ ] Create credentials if required.

**Env vars:**

- `OPENAI_API_KEY` (reused if using Whisper), or  
- Google: `GOOGLE_APPLICATION_CREDENTIALS` / service account JSON path.

---

## 7. Maps provider (optional but recommended)

- [ ] Get an API key for maps (e.g. [Google Maps](https://console.cloud.google.com), [Mapbox](https://www.mapbox.com)).
- [ ] Restrict key to your domain/app if possible.

**Env var:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

---

## 8. Mobile platform accounts (for later distribution)

- [ ] Apple Developer account (for iOS).
- [ ] Google Play Console account (for Android).

*(Not required for local development; needed when distributing the collector app.)*

---

## After provisioning

1. Copy `.env.example` to `.env.local` and fill in the values you obtained.
2. Never commit `.env` or `.env.local`; only `.env.example` (with placeholders) is in the repo.
3. In Vercel (or your host), add the same variables in the project **Environment Variables** for production/preview.

---

## Unlocks

- Ability to connect the app to real DB, storage, auth, and AI services in later tasks (T4, T8, T10, T27, T28, etc.).
