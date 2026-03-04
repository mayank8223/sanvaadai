/* ----------------- Globals --------------- */
import { NextResponse } from 'next/server';

import { ORGANIZATION_ID_COOKIE } from '@/lib/auth/organization';
import { withApiGuard } from '@/lib/auth/guards';
import { parseCreateOrganizationInput } from '@/lib/organizations/contracts';
import { createClient } from '@/lib/supabase/server';

/* ----------------- Constants --------------- */
const ORGANIZATION_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 365,
};

/* ----------------- API: GET /api/organizations --------------- */
export const GET = withApiGuard(
  async ({ context }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('memberships')
      .select(
        'id, role, organization_id, created_at, updated_at, organizations:organization_id(id, name, slug, created_at, updated_at)'
      )
      .eq('user_id', context.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      memberships: data ?? [],
      activeOrganizationId: context.activeMembership?.organization_id ?? null,
    });
  },
  {
    requireMembership: false,
  }
);

/* ----------------- API: POST /api/organizations --------------- */
export const POST = withApiGuard(
  async ({ context, request }) => {
    if (!context.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsedInput = parseCreateOrganizationInput(body);
    if (!parsedInput) {
      return NextResponse.json(
        { error: 'Invalid body. Expected { name: string, slug?: string | null }' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    if (parsedInput.slug) {
      const { data: existingBySlug, error: slugCheckError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', parsedInput.slug)
        .maybeSingle();

      if (slugCheckError) {
        return NextResponse.json({ error: slugCheckError.message }, { status: 500 });
      }

      if (existingBySlug) {
        return NextResponse.json({ error: 'Organization slug already exists' }, { status: 409 });
      }
    }

    const { data: existingByName, error: nameCheckError } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', parsedInput.name)
      .maybeSingle();

    if (nameCheckError) {
      return NextResponse.json({ error: nameCheckError.message }, { status: 500 });
    }

    if (existingByName) {
      return NextResponse.json({ error: 'Organization name already exists' }, { status: 409 });
    }

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .insert({
        name: parsedInput.name,
        slug: parsedInput.slug,
      })
      .select('id, name, slug, created_at, updated_at')
      .single();

    if (organizationError || !organization) {
      return NextResponse.json(
        { error: organizationError?.message ?? 'Failed to create org' },
        { status: 500 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        user_id: context.user.id,
        organization_id: organization.id,
        role: 'ADMIN',
      })
      .select('id, role, organization_id, created_at, updated_at')
      .single();

    if (membershipError || !membership) {
      await supabase.from('organizations').delete().eq('id', organization.id);
      return NextResponse.json(
        { error: membershipError?.message ?? 'Failed to create admin membership' },
        { status: 500 }
      );
    }

    const response = NextResponse.json(
      {
        organization,
        membership,
      },
      { status: 201 }
    );
    response.cookies.set(ORGANIZATION_ID_COOKIE, organization.id, ORGANIZATION_COOKIE_OPTIONS);
    return response;
  },
  {
    requireMembership: false,
  }
);
