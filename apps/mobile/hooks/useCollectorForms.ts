/* ----------------- Globals --------------- */
import { type Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../lib/supabase/client';
import { type CollectorFormRecord } from '../lib/forms/helpers';

/* ----------------- Types --------------- */
type MembershipRecord = {
  organization_id: string;
};

export type CollectorFormListItem = CollectorFormRecord & {
  organizationName: string | null;
};

/* ----------------- Hooks --------------- */
const useCollectorForms = (session: Session | null) => {
  const [forms, setForms] = useState<CollectorFormListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadForms = useCallback(async () => {
    if (!session?.user.id) {
      setForms([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select('organization_id, organizations:organization_id(name)')
        .eq('user_id', session.user.id);

      if (membershipsError) {
        throw new Error(membershipsError.message);
      }

      const memberships = (membershipsData ?? []) as Array<
        MembershipRecord & {
          organizations: Array<{ name: string }> | null;
        }
      >;

      const organizationIds = memberships
        .map((membership) => membership.organization_id)
        .filter((organizationId) => organizationId.length > 0);

      if (organizationIds.length === 0) {
        setForms([]);
        setIsLoading(false);
        return;
      }

      const organizationNameById = new Map<string, string | null>(
        memberships.map((membership) => [
          membership.organization_id,
          membership.organizations?.[0]?.name ?? null,
        ])
      );

      const { data: formsData, error: formsError } = await supabase
        .from('forms')
        .select(
          'id, title, description, status, updated_at, published_at, organization_id, version'
        )
        .in('organization_id', organizationIds)
        .eq('status', 'PUBLISHED')
        .order('updated_at', { ascending: false });

      if (formsError) {
        throw new Error(formsError.message);
      }

      const formRows = (formsData ?? []) as CollectorFormRecord[];
      setForms(
        formRows.map((formRow) => ({
          ...formRow,
          organizationName: organizationNameById.get(formRow.organization_id) ?? null,
        }))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load forms.');
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const formCount = useMemo<number>(() => forms.length, [forms]);

  return {
    forms,
    formCount,
    isLoading,
    errorMessage,
    refreshForms: loadForms,
  };
};

export default useCollectorForms;
