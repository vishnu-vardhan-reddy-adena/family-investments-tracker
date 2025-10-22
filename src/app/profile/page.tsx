import { Navbar } from '@/components/Navbar';
import { ProfileMessages } from '@/components/ProfileMessages';
import { ProfileTabs } from '@/components/ProfileTabs';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Disable caching for this page to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, create it
  if (profileError && profileError.code === 'PGRST116') {
    console.log('Profile not found, creating one for user:', user.id);
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create profile:', createError);
    }
  }

  // Re-fetch profile after potential creation
  const { data: finalProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user preferences
  const { data: preferences, error: preferencesError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If preferences don't exist, create them
  if (preferencesError && preferencesError.code === 'PGRST116') {
    console.log('Preferences not found, creating for user:', user.id);
    const { data: newPreferences } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  }

  // Re-fetch preferences after potential creation
  const { data: finalPreferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={null}>
        <ProfileMessages />
      </Suspense>

      {/* Navigation Bar */}
      <Navbar
        user={{
          email: user.email,
          full_name: finalProfile?.full_name,
          avatar_url: finalProfile?.avatar_url,
          role: finalProfile?.role,
        }}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProfileTabs
          user={{
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          }}
          profile={finalProfile}
          preferences={finalPreferences}
        />
      </main>
    </div>
  );
}
