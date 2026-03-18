'use client';

/* ----------------- Globals --------------- */
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const selectedMembership = memberships.find(
    (m) => m.organization_id === selectedOrganizationId
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedOrganizationId}
        onValueChange={setSelectedOrganizationId}
        disabled={isSaving}
      >
        <SelectTrigger className="w-[200px] bg-background" aria-label="Active organization">
          <SelectValue>
            {selectedMembership?.organization?.name ?? selectedOrganizationId}
            {selectedMembership && (
              <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">
                {selectedMembership.role}
              </Badge>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {memberships.map((membership) => (
            <SelectItem key={membership.organization_id} value={membership.organization_id}>
              <span className="flex items-center gap-2">
                {membership.organization?.name ?? membership.organization_id}
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {membership.role}
                </Badge>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" variant="outline" onClick={handleApply} disabled={isSaving}>
        {isSaving ? 'Switching...' : 'Switch'}
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
