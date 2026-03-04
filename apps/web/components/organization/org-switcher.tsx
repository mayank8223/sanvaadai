'use client';

/* ----------------- Globals --------------- */
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

/* ----------------- Types --------------- */
export type OrganizationOption = {
  organization_id: string;
  role: 'ADMIN' | 'COLLECTOR';
  organization: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
};

export type OrgSwitcherProps = {
  memberships: OrganizationOption[];
  activeOrganizationId: string | null;
};

/* ----------------- Component --------------- */
export const OrgSwitcher = ({ memberships, activeOrganizationId }: OrgSwitcherProps) => {
  const router = useRouter();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    activeOrganizationId ?? memberships[0]?.organization_id ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleApply = async () => {
    setError(null);
    if (!selectedOrganizationId) return;
    setIsSaving(true);

    try {
      const response = await fetch('/api/organizations/switch', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: selectedOrganizationId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? 'Failed to switch organization');
        return;
      }

      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  if (memberships.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="org-switcher" className="sr-only">
        Active organization
      </label>
      <select
        id="org-switcher"
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        value={selectedOrganizationId}
        onChange={(event) => setSelectedOrganizationId(event.target.value)}
        disabled={isSaving}
      >
        {memberships.map((membership) => (
          <option key={membership.organization_id} value={membership.organization_id}>
            {membership.organization?.name ?? membership.organization_id}
          </option>
        ))}
      </select>
      <Button type="button" size="sm" variant="outline" onClick={handleApply} disabled={isSaving}>
        {isSaving ? 'Switching…' : 'Switch'}
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
