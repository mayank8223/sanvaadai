'use client';

/* ----------------- Globals --------------- */
import { useCallback, useEffect, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

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

      if (response.ok && payload?.status === 'invite_sent') {
        setInfo(payload?.message ?? 'Invite sent. They will receive an email to join.');
        setEmail('');
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
    setError(null);
    setInfo(null);
    setMemberToRemove(null);

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

        <div className="sm:w-40">
          <label htmlFor="member-role" className="text-sm font-medium">
            Role
          </label>
          <Select
            value={role}
            onValueChange={(value) => setRole(value as 'ADMIN' | 'COLLECTOR')}
            disabled={isSubmitting}
          >
            <SelectTrigger id="member-role" className="h-10 w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COLLECTOR">Collector</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add member'}
        </Button>
      </form>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary">
          {info}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-lg border">
            <div className="border-b px-3 py-2">
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-3 py-3 last:border-b-0">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="ml-auto h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
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
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        void handleRoleChange(member.id, value as 'ADMIN' | 'COLLECTOR')
                      }
                    >
                      <SelectTrigger size="sm" className="w-32 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="COLLECTOR">Collector</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMemberToRemove(member)}
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

      <AlertDialog
        open={memberToRemove !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium text-foreground">
                {memberToRemove?.users?.full_name ?? memberToRemove?.users?.email ?? 'this member'}
              </span>{' '}
              from the organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (memberToRemove) void handleRemoveMember(memberToRemove.id);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
