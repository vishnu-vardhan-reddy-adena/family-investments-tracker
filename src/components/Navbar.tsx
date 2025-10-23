'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './Logo';
import { DarkModeToggle } from './MuiThemeProvider';

interface NavbarProps {
  user: {
    email?: string;
    full_name?: string | null;
    avatar_url?: string | null;
    role?: 'admin' | 'user';
  };
}

export function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Portfolios', href: '/portfolios', icon: '💼' },
    { name: 'Transactions', href: '/transactions', icon: '💸' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-violet-200/20 bg-white/80 backdrop-blur-lg dark:border-violet-700/20 dark:bg-gray-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="transition-transform hover:scale-105">
              <Logo size="md" variant="icon-only" />
            </Link>
            <Link href="/dashboard" className="ml-3 hidden sm:block">
              <h1 className="bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text font-['Space_Grotesk'] text-xl font-bold text-transparent">
                TrakInvests
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track • Grow • Prosper</p>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-violet-950/30 dark:hover:text-violet-400'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side - Profile and Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-gray-600 transition-all hover:bg-violet-50 hover:text-violet-600 md:hidden dark:text-gray-400 dark:hover:bg-violet-950/30 dark:hover:text-violet-400"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Dark Mode Toggle */}
            <div className="hidden md:block">
              <DarkModeToggle />
            </div>

            {/* Notifications */}
            <button
              className="hidden rounded-xl p-2 text-gray-600 transition-all hover:bg-violet-50 hover:text-violet-600 md:block dark:text-gray-400 dark:hover:bg-violet-950/30 dark:hover:text-violet-400"
              title="Notifications"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 rounded-xl border border-gray-200 bg-white px-2 py-2 transition-all hover:border-violet-300 hover:shadow-md sm:space-x-3 sm:px-3 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-violet-600"
              >
                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-violet-500 to-purple-600 sm:h-8 sm:w-8">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
                    />
                  ) : (
                    <svg
                      className="h-4 w-4 text-white sm:h-5 sm:w-5"
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
                  )}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
                <svg
                  className={`hidden h-4 w-4 text-gray-500 transition-transform sm:block dark:text-gray-400 ${profileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>
                  <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-56 rounded-lg bg-white shadow-xl ring-1 ring-black dark:bg-gray-800">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.full_name || 'User'}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <svg
                          className="mr-3 h-5 w-5"
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
                        Profile Settings
                      </Link>
                      {user.role === 'admin' && (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <svg
                              className="mr-3 h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center px-4 py-2 text-sm text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <svg
                              className="mr-3 h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                            Manage Users
                          </Link>
                          <div className="border-t border-gray-100 dark:border-gray-700"></div>
                        </>
                      )}
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <svg
                          className="mr-3 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Dashboard
                      </Link>
                      <form action="/auth/logout" method="POST">
                        <button
                          type="submit"
                          className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                        >
                          <svg
                            className="mr-3 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-violet-200/20 bg-white/95 pt-2 pb-3 backdrop-blur-lg md:hidden dark:border-violet-700/20 dark:bg-gray-900/95">
            <div className="space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-linear-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-violet-950/30 dark:hover:text-violet-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
