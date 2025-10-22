import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Fetch portfolios
  const { data: portfolios } = await supabase.from('portfolios').select('*').eq('user_id', user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolio Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {profile?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/profile"
                className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                Profile
              </Link>
              <form action="/auth/logout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Value
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹0.00</div>
            <div className="mt-1 text-sm text-green-600">+0.00%</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Invested
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹0.00</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Profit/Loss
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">₹0.00</div>
            <div className="mt-1 text-sm text-gray-600">0.00%</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">
              Portfolios
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {portfolios?.length || 0}
            </div>
          </div>
        </div>

        {/* Portfolios Section */}
        <div className="rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Portfolios
              </h2>
              <Link
                href="/portfolios/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Create Portfolio
              </Link>
            </div>
          </div>

          <div className="p-6">
            {portfolios && portfolios.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {portfolios.map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    href={`/portfolios/${portfolio.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 dark:border-gray-700"
                  >
                    <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                      {portfolio.name}
                    </h3>
                    {portfolio.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {portfolio.description}
                      </p>
                    )}
                    {portfolio.is_primary && (
                      <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Primary
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No portfolios
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new portfolio.
                </p>
                <div className="mt-6">
                  <Link
                    href="/portfolios/new"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    Create Portfolio
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/investments/add"
            className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Add Investment
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add stocks, MFs, or other assets
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/family"
            className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Family</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add family members</p>
              </div>
            </div>
          </Link>

          <Link
            href="/reports"
            className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">View Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analytics and insights</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
