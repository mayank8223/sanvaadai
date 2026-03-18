/* ----------------- Globals --------------- */
import type { FormFieldDefinition } from '@/lib/forms/contracts';
import { redirect } from 'next/navigation';

import { AuthenticatedShell } from '@/components/layout/authenticated-shell';
import {
  ADMIN_HOME_PATH,
  COLLECTOR_HOME_PATH,
  HOME_PATH,
  LOGIN_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import { getCurrentUser } from '@/lib/auth/server';
import { loadShellContext } from '@/lib/auth/shell';
import { createClient } from '@/lib/supabase/server';

import CollectorFormFillClient from './collector-form-fill-client';

/* ----------------- Page --------------- */
type CollectorFormFillPageProps = {
  params: Promise<{ id: string }>;
};

const CollectorFormFillPage = async ({ params }: CollectorFormFillPageProps) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`${LOGIN_PATH}?next=${encodeURIComponent(HOME_PATH)}`);
  }

  const shellContext = await loadShellContext(user.id);
  const activeMembership = shellContext.activeMembership;
  if (!activeMembership) {
    redirect(ONBOARDING_ORGANIZATION_PATH);
  }

  if (activeMembership.role !== 'COLLECTOR') {
    redirect(ADMIN_HOME_PATH);
  }

  const { id: formId } = await params;
  const supabase = await createClient();

  const { data: form, error } = await supabase
    .from('forms')
    .select('id, organization_id, title, description, status, fields')
    .eq('id', formId)
    .eq('organization_id', activeMembership.organization_id)
    .eq('status', 'PUBLISHED')
    .maybeSingle();

  if (error || !form) {
    redirect(COLLECTOR_HOME_PATH);
  }

  return (
    <AuthenticatedShell
      userEmail={user.email ?? null}
      memberships={shellContext.memberships}
      activeMembership={activeMembership}
      currentPath={`/collector/forms/${formId}`}
    >
      <CollectorFormFillClient
        form={{
          id: form.id,
          organization_id: form.organization_id,
          title: form.title,
          description: form.description,
          fields: (form.fields as FormFieldDefinition[]) ?? [],
        }}
        backHref={COLLECTOR_HOME_PATH}
      />
    </AuthenticatedShell>
  );
};

export default CollectorFormFillPage;
