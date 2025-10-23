import { logAuditEvent, requireAdmin } from '@/lib/auth/roles';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Require admin role
    const admin = await requireAdmin();
    const supabase = await createClient();

    const { userId } = await params;
    const body = await request.json();
    const { role } = body;

    // Validate role
    if (!role || !['admin', 'user'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent admin from removing their own admin role
    if (userId === admin.id && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 });
    }

    // Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating role:', updateError);
      return NextResponse.json(
        { error: 'Failed to update role', details: updateError.message },
        { status: 500 }
      );
    }

    // Log audit event
    await logAuditEvent('ROLE_CHANGED', 'profile', userId, {
      new_role: role,
      changed_by: admin.email,
    });

    return NextResponse.json(
      { message: 'Role updated successfully', profile: updatedProfile },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error in role update:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Require admin role
    await requireAdmin();
    const supabase = await createClient();

    const { userId } = await params;

    // Get user profile with role
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error: any) {
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
