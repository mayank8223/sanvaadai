/* ----------------- Globals --------------- */
import Link from 'next/link';

import { AuthActions } from '@/components/auth/auth-actions';
import { OrgSwitcher } from '@/components/organization/org-switcher';
import { APP_NAME, APP_VERSION, HELP_URL, PRIVACY_URL } from '@/lib/constants';
import {
  ADMIN_HOME_PATH,
  COLLECTOR_HOME_PATH,
  HOME_PATH,
  ONBOARDING_ORGANIZATION_PATH,
} from '@/lib/auth/home-routing';
import type { OrganizationOption } from '@/lib/auth/shell';
import { cn } from '@/lib/utils';

/* ----------------- Constants --------------- */
const ACTIVE_LINK_CLASSNAME = 'bg-primary/10 text-primary font-medium';
const INACTIVE_LINK_CLASSNAME = 'text-muted-foreground hover:text-foreground';

/* ----------------- Types --------------- */
type NavItem = {
  href: string;
  label: string;
  match: 'exact' | 'prefix';
};

export type AuthenticatedShellProps = {
  userEmail: string | null;
  memberships: OrganizationOption[];
  activeMembership: OrganizationOption | null;
  currentPath: string;
  children: React.ReactNode;
};

/* ----------------- Helpers --------------- */
const getPrimaryNav = (role: OrganizationOption['role'] | null): NavItem[] => {
  if (role === 'ADMIN') {
    return [
      { href: ADMIN_HOME_PATH, label: 'Home', match: 'exact' },
      { href: '/forms', label: 'Forms', match: 'prefix' },
      { href: '/settings/team', label: 'Team', match: 'prefix' },
    ];
  }

  if (role === 'COLLECTOR') {
    return [
      { href: COLLECTOR_HOME_PATH, label: 'Home', match: 'exact' },
      { href: '/forms', label: 'Forms', match: 'prefix' },
    ];
  }

  return [{ href: ONBOARDING_ORGANIZATION_PATH, label: 'Get started', match: 'prefix' }];
};

const isNavItemActive = (item: NavItem, currentPath: string): boolean => {
  if (item.match === 'exact') {
    return currentPath === item.href;
  }

  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
};

/* ----------------- Component --------------- */
export const AuthenticatedShell = ({
  userEmail,
  memberships,
  activeMembership,
  currentPath,
  children,
}: AuthenticatedShellProps) => {
  const activeOrganizationName = activeMembership?.organization?.name ?? 'No active organization';
  const role = activeMembership?.role ?? null;
  const navItems = getPrimaryNav(role);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href={HOME_PATH}
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                {APP_NAME}
              </Link>
              <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {activeOrganizationName}
              </span>
              {role && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <OrgSwitcher
                memberships={memberships}
                activeOrganizationId={activeMembership?.organization_id ?? null}
              />
              <AuthActions userEmail={userEmail ?? 'Signed in'} />
            </div>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-4 text-sm">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item, currentPath);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-md px-2 py-1 transition-colors',
                    isActive ? ACTIVE_LINK_CLASSNAME : INACTIVE_LINK_CLASSNAME
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">{children}</main>
      <footer className="border-t bg-card/40">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-muted-foreground md:px-6">
          <span>{APP_VERSION}</span>
          <div className="flex items-center gap-4">
            <a href={HELP_URL} target="_blank" rel="noreferrer" className="hover:text-foreground">
              Help
            </a>
            <a
              href={PRIVACY_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
