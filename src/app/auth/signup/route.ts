import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      new URL(`/signup?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }

  // Create profile after signup
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email!,
      full_name: fullName,
    });
  }

  return NextResponse.redirect(
    new URL('/login?message=Check your email to confirm your account', request.url)
  );
}
