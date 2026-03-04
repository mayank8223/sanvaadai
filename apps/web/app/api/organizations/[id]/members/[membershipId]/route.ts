/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { withApiGuard } from '@/lib/auth/guards';
import { parseUpdateMemberRoleInput } from '@/lib/organizations/contracts';
import { canDemoteMembership, canRemoveMembership } from '@/lib/organizations/policies';
import {
  getOrganizationAdminMembershipCount,
  getUserMembershipsForOrganization,
} from '@/lib/organizations/service';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Helpers --------------- */
const getRouteParamsFromPathname = (
  pathname: string
): { organizationId: string | null; membershipId: string | null } => {
  const segments = pathname.split('/').filter(Boolean);
  const organizationsIndex = segments.lastIndexOf('organizations');
  const membersIndex = segments.lastIndexOf('members');

  const organizationId =
    organizationsIndex >= 0 ? (segments[organizationsIndex + 1] ?? null) : null;
  const membershipId = membersIndex >= 0 ? (segments[membersIndex + 1] ?? null) : null;

  return {
    organizationId: organizationId?.trim() ? organizationId : null,
    membershipId: membershipId?.trim() ? membershipId : null,
  };
};

const resolveAdminMembershipForOrganization = async (userId: string, organizationId: string) => {
  const memberships = await getUserMembershipsForOrganization(userId, organizationId);
  return memberships.find((membership) => membership.role === 'ADMIN') ?? null;
};

/* ----------------- API: PATCH /api/organizations/:id/members/:membershipId --------------- */
export const PATCH = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, membershipId } = getRouteParamsFromPathname(
      new URL(request.url).pathname
    );
    if (!organizationId || !membershipId) {
      return NextResponse.json(
        { error: 'Organization id and membership id are required' },
        { status: 400 }
      );
    }

    let adminMembership;
    try {
      adminMembership = await resolveAdminMembershipForOrganization(
        context.user.id,
        organizationId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load membership';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!adminMembership) {
      return NextResponse.json({ error: 'Forbidden: Admin membership required' }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedInput = parseUpdateMemberRoleInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        { error: 'Invalid body. Expected { role: "ADMIN" | "COLLECTOR" }' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('id, role, user_id, organization_id, created_at, updated_at')
      .eq('id', membershipId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    let adminCount = 0;
    try {
      adminCount = await getOrganizationAdminMembershipCount(organizationId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to evaluate admin constraints';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const isAllowed = canDemoteMembership(
      { id: membership.id, role: membership.role },
      parsedInput.role,
      adminCount
    );
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Cannot demote the last organization admin' },
        { status: 409 }
      );
    }

    const { data: updatedMembership, error: updateError } = await supabase
      .from('memberships')
      .update({
        role: parsedInput.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membershipId)
      .eq('organization_id', organizationId)
      .select('id, role, user_id, organization_id, created_at, updated_at')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ member: updatedMembership });
  },
  {
    requireMembership: false,
  }
);

/* ----------------- API: DELETE /api/organizations/:id/members/:membershipId --------------- */
export const DELETE = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organizationId, membershipId } = getRouteParamsFromPathname(
      new URL(request.url).pathname
    );
    if (!organizationId || !membershipId) {
      return NextResponse.json(
        { error: 'Organization id and membership id are required' },
        { status: 400 }
      );
    }

    let adminMembership;
    try {
      adminMembership = await resolveAdminMembershipForOrganization(
        context.user.id,
        organizationId
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load membership';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    if (!adminMembership) {
      return NextResponse.json({ error: 'Forbidden: Admin membership required' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('id, role, user_id, organization_id')
      .eq('id', membershipId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 500 });
    }

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    let adminCount = 0;
    try {
      adminCount = await getOrganizationAdminMembershipCount(organizationId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to evaluate admin constraints';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const isAllowed = canRemoveMembership({ id: membership.id, role: membership.role }, adminCount);
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Cannot remove the last organization admin' },
        { status: 409 }
      );
    }

    const { error: deleteError } = await supabase
      .from('memberships')
      .delete()
      .eq('id', membershipId)
      .eq('organization_id', organizationId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  },
  {
    requireMembership: false,
  }
);
