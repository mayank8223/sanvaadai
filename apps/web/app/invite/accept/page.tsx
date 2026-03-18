/* ----------------- Globals --------------- */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { syncUserProfile } from '@/lib/auth/user-sync';
import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import {
  acceptOrganizationInvite,
  acceptOrganizationInviteByEmail,
} from '@/lib/organizations/invites';
import { getCurrentUser } from '@/lib/auth/server';
import { InviteAcceptClient } from './invite-accept-client';

/* ----------------- Page --------------- */
type InviteAcceptPageProps = {
  searchParams: Promise<{ token?: string; email?: string }>;
};

const InviteAcceptPage = async ({ searchParams }: InviteAcceptPageProps) => {
  const params = await searchParams;
  const token = params.token?.trim();
  const email = params.email?.trim();

  const user = await getCurrentUser();

  if (email && !user) {
    return <InviteAcceptClient email={email} />;
  }

  if (email && user) {
    const supabase = await createClient();
    await syncUserProfile(supabase, user);

    const result = await acceptOrganizationInviteByEmail(
      user.id,
      user.email ?? ''
    );

    if (!result.ok) {
      redirect(`/login?error=${encodeURIComponent(result.error)}`);
    }

    if (result.organizationId) {
      const cookieStore = await cookies();
      cookieStore.set(ORGANIZATION_ID_COOKIE, result.organizationId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    redirect('/');
  }

  if (!token) {
    redirect('/login?error=Invalid+invite+link');
  }

  if (!user) {
    const next = encodeURIComponent(`/invite/accept?token=${token}`);
    redirect(`/login?next=${next}`);
  }

  const supabase = await createClient();
  await syncUserProfile(supabase, user);

  const result = await acceptOrganizationInvite(
    token,
    user.id,
    user.email ?? ''
  );

  if (!result.ok) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  if (result.organizationId) {
    const cookieStore = await cookies();
    cookieStore.set(ORGANIZATION_ID_COOKIE, result.organizationId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  redirect('/');
};

export default InviteAcceptPage;
