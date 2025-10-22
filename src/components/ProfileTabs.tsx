'use client';

import { AvatarUpload } from '@/components/AvatarUpload';
import { useState } from 'react';

interface ProfileTabsProps {
  user: {
    id: string;
    email?: string;
    created_at: string;
  };
  profile: {
    full_name?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postal_code?: string | null;
  } | null;
  preferences: {
    theme?: string | null;
    language?: string | null;
    currency?: string | null;
    timezone?: string | null;
    notifications_email?: boolean;
    notifications_push?: boolean;
    two_factor_enabled?: boolean;
  } | null;
}

type TabType = 'personal' | 'security' | 'preferences';

export function ProfileTabs({ user, profile, preferences }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    {
      id: 'personal' as TabType,
      name: 'Personal Information',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: 'security' as TabType,
      name: 'Security',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: 'preferences' as TabType,
      name: 'Preferences',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <nav className="space-y-1 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-violet-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-3">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>

        {/* Account Info Card */}
        <div className="mt-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">Account Status</h3>
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
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isEditing ? 'Update your personal details' : 'View your personal details'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                {isEditing ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Cancel
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <form action="/api/profile/update" method="POST" className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Profile Photo
                  </label>
                  <AvatarUpload currentAvatarUrl={profile?.avatar_url || null} />
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="full_name"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    defaultValue={profile?.full_name || ''}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={profile?.phone || ''}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="+91 1234567890"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label
                    htmlFor="date_of_birth"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    defaultValue={profile?.date_of_birth || ''}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    defaultValue={profile?.address || ''}
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Enter your address"
                  />
                </div>

                {/* City, State, Country, Postal Code in Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      defaultValue={profile?.city || ''}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      defaultValue={profile?.state || ''}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      defaultValue={profile?.country || 'India'}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postal_code"
                      className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      name="postal_code"
                      defaultValue={profile?.postal_code || ''}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-6">
                {/* Profile Photo - View Mode */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full bg-linear-to-br from-violet-500 to-purple-600 shadow-lg">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white">
                        <svg
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {profile?.full_name || 'Not set'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>

                {/* Information Grid - View Mode */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.full_name || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Email Address
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Phone Number
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.phone || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Date of Birth
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.date_of_birth
                        ? new Date(profile.date_of_birth).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Not provided'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Address
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.address || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      City
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.city || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      State
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.state || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Country
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.country || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Postal Code
                    </label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.postal_code || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}{' '}
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your password and security settings
                </p>
              </div>
            </div>

            {/* Change Password */}
            <form action="/api/profile/change-password" method="POST" className="space-y-6">
              <div>
                <label
                  htmlFor="current_password"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="new_password"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="submit"
                  className="rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                >
                  Change Password
                </button>
              </div>
            </form>

            {/* Two-Factor Authentication */}
            <div className="mt-8 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  {preferences?.two_factor_enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    preferences?.two_factor_enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {preferences?.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Customize your experience
                </p>
              </div>
            </div>

            <form action="/api/profile/update" method="POST" className="space-y-6">
              {/* Theme */}
              <div>
                <label
                  htmlFor="theme"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  defaultValue={preferences?.theme || 'system'}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  defaultValue={preferences?.language || 'en'}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label
                  htmlFor="currency"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  defaultValue={preferences?.currency || 'INR'}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label
                  htmlFor="timezone"
                  className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  name="timezone"
                  defaultValue={preferences?.timezone || 'Asia/Kolkata'}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                >
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="notifications_email"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Email Notifications
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receive updates via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="notifications_email"
                    name="notifications_email"
                    defaultChecked={preferences?.notifications_email ?? true}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="notifications_push"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Push Notifications
                    </label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Receive browser notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="notifications_push"
                    name="notifications_push"
                    defaultChecked={preferences?.notifications_push ?? true}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="submit"
                  className="rounded-lg bg-linear-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
