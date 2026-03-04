/* ----------------- Globals --------------- */
import type { MembershipRole } from '@/lib/auth/organization';

/* ----------------- Types --------------- */
export type MembershipRecord = {
  id: string;
  role: MembershipRole;
};

/* ----------------- Helpers --------------- */
export const countAdminMemberships = (memberships: MembershipRecord[]): number =>
  memberships.filter((membership) => membership.role === 'ADMIN').length;

export const canDemoteMembership = (
  targetMembership: MembershipRecord,
  nextRole: MembershipRole,
  adminMembershipCount: number
): boolean => {
  if (targetMembership.role !== 'ADMIN') return true;
  if (nextRole === 'ADMIN') return true;
  return adminMembershipCount > 1;
};

export const canRemoveMembership = (
  targetMembership: MembershipRecord,
  adminMembershipCount: number
): boolean => {
  if (targetMembership.role !== 'ADMIN') return true;
  return adminMembershipCount > 1;
};
