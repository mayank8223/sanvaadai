/* ----------------- Globals --------------- */
import { type Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { OFFLINE_COPY } from '../constants';
import { supabase } from '../lib/supabase/client';
import { type CollectorFormRecord } from '../lib/forms/helpers';
import { readCachedForms, saveCachedForms } from '../lib/offline/forms-cache';

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
      setErrorMessage(null);
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
      const resolvedForms = formRows.map((formRow) => ({
        ...formRow,
        organizationName: organizationNameById.get(formRow.organization_id) ?? null,
      }));

      setForms(resolvedForms);
      await saveCachedForms(resolvedForms);
    } catch (error) {
      const cachedForms = await readCachedForms();
      if (cachedForms && cachedForms.length > 0) {
        setForms(cachedForms);
        setErrorMessage(OFFLINE_COPY.usingCachedFormsMessage);
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load forms.');
        setForms([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  const warmCachedForms = useCallback(async () => {
    const cachedForms = await readCachedForms();
    if (cachedForms && cachedForms.length > 0) {
      setForms(cachedForms);
    }
  }, []);

  useEffect(() => {
    void warmCachedForms();
  }, [warmCachedForms]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    void loadForms();
  }, [loadForms, session?.user.id]);

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
