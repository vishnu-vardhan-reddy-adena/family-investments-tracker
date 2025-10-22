import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const newPassword = formData.get('new_password') as string;
  const confirmPassword = formData.get('confirm_password') as string;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent('Passwords do not match')}`, request.url)
    );
  }

  // Validate password length
  if (newPassword.length < 8) {
    return NextResponse.redirect(
      new URL(
        `/profile?error=${encodeURIComponent('Password must be at least 8 characters')}`,
        request.url
      )
    );
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL('/profile?success=Password updated successfully', request.url)
  );
}
