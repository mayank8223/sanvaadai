/**
 * T9 – User, Organization, and Membership (shared types for Supabase schema).
 * Used by web, mobile, and API for multi-tenancy and RBAC.
 */

export const MEMBERSHIP_ROLES = ['ADMIN', 'COLLECTOR'] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export type User = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string | null;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  role: MembershipRole;
  created_at: string;
  updated_at: string;
};

/** Membership with joined user (for listing org members) */
export type MembershipWithUser = Membership & {
  user: Pick<User, 'id' | 'email' | 'full_name' | 'avatar_url'>;
};

/** Membership with joined organization (for listing user's orgs) */
export type MembershipWithOrganization = Membership & {
  organization: Organization;
};
