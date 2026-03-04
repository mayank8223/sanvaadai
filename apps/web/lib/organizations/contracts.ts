/* ----------------- Globals --------------- */
import { MEMBERSHIP_ROLES, type MembershipRole } from '@/lib/auth/organization';

/* ----------------- Types --------------- */
export type CreateOrganizationInput = {
  name: string;
  slug: string | null;
};

export type SwitchOrganizationInput = {
  organizationId: string;
};

export type CreateMemberInput = {
  role: MembershipRole;
  userId: string | null;
  email: string | null;
};

export type UpdateMemberRoleInput = {
  role: MembershipRole;
};

/* ----------------- Helpers --------------- */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
};

const parseSlug = (value: unknown): string | null => {
  const parsedValue = parseString(value);
  if (!parsedValue) return null;
  return /^[a-z0-9-]+$/.test(parsedValue) ? parsedValue : null;
};

const parseRole = (value: unknown): MembershipRole | null =>
  typeof value === 'string' && MEMBERSHIP_ROLES.includes(value as MembershipRole)
    ? (value as MembershipRole)
    : null;

/* ----------------- Parsers --------------- */
export const parseCreateOrganizationInput = (value: unknown): CreateOrganizationInput | null => {
  if (!isObjectRecord(value)) return null;

  const name = parseString(value.name);
  if (!name) return null;

  if (!Object.prototype.hasOwnProperty.call(value, 'slug')) {
    return { name, slug: null };
  }

  if (value.slug === null || value.slug === undefined) {
    return { name, slug: null };
  }

  const slug = parseSlug(value.slug);
  if (!slug) return null;

  return { name, slug };
};

export const parseSwitchOrganizationInput = (value: unknown): SwitchOrganizationInput | null => {
  if (!isObjectRecord(value)) return null;
  const organizationId = parseString(value.organizationId);
  if (!organizationId) return null;
  return { organizationId };
};

export const parseCreateMemberInput = (value: unknown): CreateMemberInput | null => {
  if (!isObjectRecord(value)) return null;

  const role = parseRole(value.role);
  if (!role) return null;

  const parsedUserId = parseString(value.userId);
  const parsedEmail = parseString(value.email)?.toLowerCase() ?? null;

  if (!parsedUserId && !parsedEmail) return null;

  return {
    role,
    userId: parsedUserId,
    email: parsedEmail,
  };
};

export const parseUpdateMemberRoleInput = (value: unknown): UpdateMemberRoleInput | null => {
  if (!isObjectRecord(value)) return null;
  const role = parseRole(value.role);
  if (!role) return null;
  return { role };
};
