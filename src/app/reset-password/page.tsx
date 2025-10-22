'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have the required token/code from the URL
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setMessage({
        type: 'error',
        text: errorDescription || 'Invalid or expired reset link. Please request a new one.',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords
    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.',
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setMessage({
        type: 'success',
        text: 'Password has been reset successfully. Redirecting to login...',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Enter your new password below.</p>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full max-w-md">
            <div className="rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
