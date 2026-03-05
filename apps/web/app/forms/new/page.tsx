/* ----------------- Globals --------------- */
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import FormBuilderScreen from '@/components/forms/form-builder-screen';
import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import { getCurrentUser } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const FORMS_PATH = '/forms';
const LOGIN_PATH = '/login';
const ONBOARDING_ORGANIZATION_PATH = '/onboarding/organization';
const MEMBERSHIP_SELECT_COLUMNS = 'organization_id, role';

/* ----------------- Helpers --------------- */
const getActiveMembership = (
  memberships: Array<{ organization_id: string; role: 'ADMIN' | 'COLLECTOR' }>,
  requestedOrganizationId: string | null
) => {
  if (!requestedOrganizationId) {
    return memberships[0] ?? null;
  }

  return memberships.find((membership) => membership.organization_id === requestedOrganizationId) ?? null;
};

/* ----------------- Page --------------- */
const NewFormPage = async () => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent('/forms/new')}`);
  }

  const supabase = await createClient();
  const { data: membershipsData, error } = await supabase
    .from('memberships')
    .select(MEMBERSHIP_SELECT_COLUMNS)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
        <p className="text-sm text-destructive">Failed to load memberships: {error.message}</p>
      </main>
    );
  }

  const memberships = (membershipsData ?? []) as Array<{
    organization_id: string;
    role: 'ADMIN' | 'COLLECTOR';
  }>;

  const cookieStore = await cookies();
  const requestedOrganizationId = cookieStore.get(ORGANIZATION_ID_COOKIE)?.value ?? null;
  const activeMembership = getActiveMembership(memberships, requestedOrganizationId);

  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'ADMIN') {
    redirect(FORMS_PATH);
  }

  return <FormBuilderScreen mode="create" />;
};

export default NewFormPage;
