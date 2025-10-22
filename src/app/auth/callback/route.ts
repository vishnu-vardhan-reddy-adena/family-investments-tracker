import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const type = searchParams.get('type');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('Callback - Code exchange error:', error);
    console.log('Callback - Type:', type);
    console.log('Callback - Next:', next);

    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        console.log('Redirecting to reset password page');
        return NextResponse.redirect(new URL('/reset-password', request.url));
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=Unable to authenticate', request.url));
}
