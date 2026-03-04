/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';

import {
  type AuthOrganizationContext,
  type MembershipRole,
  resolveAuthOrganizationContext,
} from './organization';
import { syncUserProfile } from './user-sync';

/* ----------------- Types --------------- */
export type ApiGuardOptions = {
  requireAuth?: boolean;
  requireMembership?: boolean;
  allowedRoles?: MembershipRole[];
};

export type GuardedApiHandler = (params: {
  request: Request;
  context: AuthOrganizationContext;
}) => Promise<Response> | Response;

type GuardDecision = {
  ok: boolean;
  status?: number;
  error?: string;
};

type EvaluateGuardInput = {
  context: AuthOrganizationContext;
  options: Required<ApiGuardOptions>;
};

/* ----------------- Constants --------------- */
const DEFAULT_GUARD_OPTIONS: Required<ApiGuardOptions> = {
  requireAuth: true,
  requireMembership: true,
  allowedRoles: [],
};

/* ----------------- Helpers --------------- */
const mergeGuardOptions = (options: ApiGuardOptions): Required<ApiGuardOptions> => ({
  ...DEFAULT_GUARD_OPTIONS,
  ...options,
  allowedRoles: options.allowedRoles ?? DEFAULT_GUARD_OPTIONS.allowedRoles,
});

export const evaluateGuardDecision = ({ context, options }: EvaluateGuardInput): GuardDecision => {
  const { user, activeMembership, requestedOrganizationId } = context;

  if (options.requireAuth && !user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  if (!options.requireMembership) {
    return { ok: true };
  }

  if (!activeMembership) {
    const errorMessage = requestedOrganizationId
      ? 'Forbidden: No membership for requested organization'
      : 'Forbidden: Membership required';
    return { ok: false, status: 403, error: errorMessage };
  }

  if (options.allowedRoles.length === 0) {
    return { ok: true };
  }

  if (!options.allowedRoles.includes(activeMembership.role)) {
    return { ok: false, status: 403, error: 'Forbidden: Insufficient role' };
  }

  return { ok: true };
};

export const withApiGuard = (handler: GuardedApiHandler, options: ApiGuardOptions = {}) => {
  const resolvedOptions = mergeGuardOptions(options);

  return async (request: Request) => {
    const user = await getCurrentUser();

    if (user) {
      try {
        const supabase = await createClient();
        await syncUserProfile(supabase, user);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync user profile';
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    const baseContext: AuthOrganizationContext = {
      user,
      memberships: [],
      requestedOrganizationId: null,
      activeMembership: null,
    };

    const context = user ? await resolveAuthOrganizationContext(user, request) : baseContext;
    const decision = evaluateGuardDecision({ context, options: resolvedOptions });

    if (!decision.ok) {
      return NextResponse.json({ error: decision.error }, { status: decision.status });
    }

    const response = await handler({ request, context });
    if (context.activeMembership) {
      response.headers.set('x-organization-id', context.activeMembership.organization_id);
      response.headers.set('x-membership-role', context.activeMembership.role);
    }

    return response;
  };
};
