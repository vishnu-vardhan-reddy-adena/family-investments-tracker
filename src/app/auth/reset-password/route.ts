import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the current user (should be authenticated via the reset token)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log('Reset password - User:', user?.email);
    console.log('Reset password - Error:', userError);

    if (userError || !user) {
      console.error('No authenticated user found for password reset');
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 401 }
      );
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
