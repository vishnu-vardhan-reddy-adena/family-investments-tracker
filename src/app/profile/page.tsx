import { AvatarUpload } from '@/components/AvatarUpload';
import { ProfileMessages } from '@/components/ProfileMessages';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
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
    await supabase.from('user_preferences').insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Use finalProfile instead of profile
  const profileData = finalProfile;

  // Debug logging
  console.log('Profile data:', {
    full_name: profileData?.full_name,
    phone: profileData?.phone,
    avatar_url: profileData?.avatar_url,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={null}>
        <ProfileMessages />
      </Suspense>

      {/* Header */}
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings and preferences
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <a
                href="#personal"
                className="flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </a>
              <a
                href="#security"
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Security
              </a>
              <a
                href="#preferences"
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Preferences
              </a>
            </nav>

            {/* Account Info Card */}
            <div className="mt-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
              <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                Account Status
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Member since</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Personal Information Section */}
            <div id="personal" className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Update your personal details here
                  </p>
                </div>
              </div>

              <form action="/api/profile/update" method="POST" className="space-y-6">
                {/* Debug Info - Remove after testing */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="rounded bg-gray-100 p-4 text-xs dark:bg-gray-700">
                    <p className="font-bold">Debug Info:</p>
                    <p>Profile loaded: {profileData ? 'Yes' : 'No'}</p>
                    <p>Full Name: {profileData?.full_name || 'Not set'}</p>
                    <p>Phone: {profileData?.phone || 'Not set'}</p>
                    <p>Avatar URL: {profileData?.avatar_url || 'Not set'}</p>
                  </div>
                )}

                {/* Avatar Upload */}
                <AvatarUpload currentAvatarUrl={profileData?.avatar_url} />

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Full Name
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    defaultValue={profileData?.full_name || ''}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ''}
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone (optional) */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Phone Number <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profileData?.phone || ''}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div id="security" className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your password and security settings
                </p>
              </div>

              <form action="/api/profile/change-password" method="POST" className="space-y-6">
                <div>
                  <label
                    htmlFor="current_password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Current Password
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    New Password
                  </label>
                  <input
                    id="new_password"
                    name="new_password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                </div>

                <div>
                  <label
                    htmlFor="confirm_password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Two-Factor Authentication */}
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div id="preferences" className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
              <div className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your experience
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive email about portfolio updates
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      defaultChecked={preferences?.email_notifications ?? true}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                {/* Price Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Price Alerts
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when stock prices change
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      defaultChecked={preferences?.price_alerts ?? false}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>

                {/* Weekly Reports */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Weekly Portfolio Report
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive weekly summary of your portfolio
                    </p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      defaultChecked={preferences?.weekly_reports ?? true}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
              <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-200">
                Danger Zone
              </h3>
              <p className="mb-4 text-sm text-red-700 dark:text-red-300">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                type="button"
                className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
