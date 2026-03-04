/**
 * T9 – User, Organization, and Membership schema (Drizzle ORM).
 * Source of truth for table definitions; RLS and auth trigger are in custom migrations.
 */

import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

/* ----------------- Enums --------------- */

export const membershipRoleEnum = pgEnum('membership_role', ['ADMIN', 'COLLECTOR']);
export const formStatusEnum = pgEnum('form_status', ['DRAFT', 'PUBLISHED', 'ARCHIVED']);

/* ----------------- Tables --------------- */

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_organizations_slug').on(table.slug)]
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
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
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
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('memberships_user_id_organization_id_key').on(table.user_id, table.organization_id),
    index('idx_memberships_user_id').on(table.user_id),
    index('idx_memberships_organization_id').on(table.organization_id),
  ]
);

export const forms = pgTable(
  'forms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organization_id: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    created_by_user_id: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    title: text('title').notNull(),
    description: text('description'),
    status: formStatusEnum('status').notNull().default('DRAFT'),
    fields: jsonb('fields').notNull().default([]),
    version: integer('version').notNull().default(1),
    published_at: timestamp('published_at', { withTimezone: true }),
    archived_at: timestamp('archived_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_forms_organization_id').on(table.organization_id),
    index('idx_forms_status').on(table.status),
    index('idx_forms_created_by_user_id').on(table.created_by_user_id),
  ]
);

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organization_id: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    form_id: uuid('form_id')
      .notNull()
      .references(() => forms.id, { onDelete: 'cascade' }),
    collector_user_id: uuid('collector_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    payload: jsonb('payload').notNull().default({}),
    metadata: jsonb('metadata').notNull().default({}),
    submitted_at: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_submissions_organization_id').on(table.organization_id),
    index('idx_submissions_form_id').on(table.form_id),
    index('idx_submissions_collector_user_id').on(table.collector_user_id),
    index('idx_submissions_submitted_at').on(table.submitted_at),
  ]
);
