import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = formData.get('full_name') as string;
  const phone = formData.get('phone') as string;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Update profile in database
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    return NextResponse.redirect(
      new URL(`/profile?error=${encodeURIComponent('Failed to update profile')}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL('/profile?success=Profile updated successfully', request.url)
  );
}
