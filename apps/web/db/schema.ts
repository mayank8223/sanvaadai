/**
 * T9 – User, Organization, and Membership schema (Drizzle ORM).
 * Source of truth for table definitions; RLS and auth trigger are in custom migrations.
 */

import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/* ----------------- Enums --------------- */

export const membershipRoleEnum = pgEnum('membership_role', [
  'ADMIN',
  'COLLECTOR',
]);

/* ----------------- Tables --------------- */

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('idx_organizations_slug').on(table.slug),
  ]
);

/**
 * Application users (1:1 with auth.users).
 * FK to auth.users(id) is added in a custom migration (Drizzle cannot reference auth schema).
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organization_id: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: membershipRoleEnum('role').notNull(),
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('memberships_user_id_organization_id_key').on(
      table.user_id,
      table.organization_id
    ),
    index('idx_memberships_user_id').on(table.user_id),
    index('idx_memberships_organization_id').on(table.organization_id),
  ]
);
