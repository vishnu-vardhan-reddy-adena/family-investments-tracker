'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setMessage({
        type: 'success',
        text: 'Password reset link has been sent to your email. Please check your inbox.',
      });
      setEmail('');
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
              Forgot Password?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your email address and we'll send you a link to reset your password.
            </p>
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
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
