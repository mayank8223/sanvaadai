# Invite Email Template (Supabase)

To avoid "Email link is invalid or has expired" errors (often caused by email prefetching in Outlook, Gmail, etc.), use the **OTP flow** instead of the default magic link.

## Update the Supabase Invite Template

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Select **Invite user**
3. Replace the template with:

### Subject
```
You're invited to join {{ .SiteURL }}
```

### Body (HTML)
```html
<h2>You're invited</h2>
<p>You've been invited to join a team. Click the link below, then enter the 6-digit code from this email:</p>
<p><a href="{{ .SiteURL }}/invite/accept?email={{ .Email }}">Accept invite</a></p>
<p style="font-size: 1.25rem; font-weight: 600; letter-spacing: 0.25em;">{{ .Token }}</p>
<p style="font-size: 0.875rem; color: #71717a;">This code expires in 1 hour. If you didn't expect this email, you can ignore it.</p>
```

## Why This Works

- The link goes to **your app** (`/invite/accept?email=...`), not Supabase's verify URL
- Email prefetching/scanners that "click" links will hit your page, not consume the OTP
- The user manually enters the 6-digit code, which is only consumed when they submit
- After verification, the user is prompted to **set a password** before joining (required for email/password sign-in later)

## Redirect URL

Add your invite accept URL to **Authentication** → **URL Configuration** → **Redirect URLs**:

- `http://localhost:3000/invite/accept`
- `https://yourdomain.com/invite/accept`
