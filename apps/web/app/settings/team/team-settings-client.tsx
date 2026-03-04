'use client';

/* ----------------- Globals --------------- */
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ----------------- Types --------------- */
type TeamMember = {
  id: string;
  role: 'ADMIN' | 'COLLECTOR';
  user_id: string;
  created_at: string;
  users: {
    id: string;
    email: string | null;
    full_name: string | null;
  } | null;
};

type TeamSettingsClientProps = {
  organizationId: string;
};

/* ----------------- Component --------------- */
export const TeamSettingsClient = ({ organizationId }: TeamSettingsClientProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'COLLECTOR'>('COLLECTOR');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        members?: TeamMember[];
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? 'Failed to load members');
        return;
      }

      setMembers(payload?.members ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const handleAddMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/members`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        status?: string;
        message?: string;
      } | null;

      if (response.status === 202) {
        setInfo(payload?.message ?? 'User not found. Ask them to sign up first.');
        return;
      }

      if (!response.ok) {
        setError(payload?.error ?? 'Failed to add member');
        return;
      }

      setEmail('');
      await loadMembers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (membershipId: string, nextRole: 'ADMIN' | 'COLLECTOR') => {
    setError(null);
    setInfo(null);

    const response = await fetch(`/api/organizations/${organizationId}/members/${membershipId}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        role: nextRole,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(payload?.error ?? 'Failed to update role');
      return;
    }

    await loadMembers();
  };

  const handleRemoveMember = async (membershipId: string) => {
    const confirmed = window.confirm('Remove this member from the organization?');
    if (!confirmed) return;

    setError(null);
    setInfo(null);

    const response = await fetch(`/api/organizations/${organizationId}/members/${membershipId}`, {
      method: 'DELETE',
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(payload?.error ?? 'Failed to remove member');
      return;
    }

    await loadMembers();
  };

  return (
    <div className="space-y-6">
      <form
        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-end"
        onSubmit={handleAddMember}
      >
        <div className="flex-1 space-y-2">
          <label htmlFor="member-email" className="text-sm font-medium">
            Add member by email
          </label>
          <Input
            id="member-email"
            type="email"
            autoComplete="email"
            placeholder="collector@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="member-role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="member-role"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(event) => setRole(event.target.value as 'ADMIN' | 'COLLECTOR')}
            disabled={isSubmitting}
          >
            <option value="COLLECTOR">Collector</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add member'}
        </Button>
      </form>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
          {info}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading team members…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No members found for this organization.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Added</th>
                <th className="px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b">
                  <td className="px-3 py-2">{member.users?.full_name ?? '—'}</td>
                  <td className="px-3 py-2 text-muted-foreground">{member.users?.email ?? '—'}</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      value={member.role}
                      onChange={(event) =>
                        void handleRoleChange(
                          member.id,
                          event.target.value as 'ADMIN' | 'COLLECTOR'
                        )
                      }
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="COLLECTOR">COLLECTOR</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
