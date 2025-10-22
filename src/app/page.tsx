import { Logo } from '@/components/Logo';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-indigo-950/20">
      {/* Public Navbar */}
      <nav className="relative z-20 border-b border-violet-200/20 bg-white/80 backdrop-blur-lg dark:border-violet-700/20 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center transition-transform hover:scale-105">
              <Logo size="sm" />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-violet-600 transition-all hover:bg-violet-50 sm:px-6 sm:text-base dark:text-violet-400 dark:hover:bg-violet-950/30"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:px-6 sm:text-base"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-500/10" />
        <div className="absolute -right-1/4 -bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/10" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-500/10" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8 sm:py-12 md:py-16 lg:py-20">
        {/* Hero Section */}
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col items-center space-y-4 sm:mb-10 sm:space-y-6 md:mb-12 md:space-y-8">
            <div className="animate-float">
              <Logo size="xl" />
            </div>
            <h1 className="bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text px-4 text-center font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
              TrakInvests
            </h1>
            <p className="max-w-2xl px-4 text-center text-base text-gray-600 sm:text-lg md:text-xl dark:text-gray-300">
              Your AI-powered financial companion for tracking Indian investments
              <span className="mt-2 block bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-sm font-medium text-transparent sm:text-base md:text-lg">
                Stocks • Mutual Funds • ETFs • FDs • NPS • EPFO • Real Estate
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex w-full flex-col flex-wrap justify-center gap-3 px-4 sm:w-auto sm:flex-row sm:gap-4">
              <Link
                href="/signup"
                className="group relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:px-8 sm:py-4"
              >
                <span className="relative z-10">Start Tracking Free</span>
                <div className="absolute inset-0 bg-linear-to-r from-violet-700 via-purple-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/login"
                className="rounded-2xl border-2 border-violet-600 px-6 py-3 text-center font-semibold text-violet-600 transition-all hover:bg-violet-50 sm:px-8 sm:py-4 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-950/30"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 px-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 md:mb-16 lg:grid-cols-4">
            <div className="group relative overflow-hidden rounded-3xl bg-white/60 p-5 shadow-lg backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl sm:p-6 dark:bg-gray-900/60">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 text-2xl shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl">
                📊
              </div>
              <h2 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Live NSE Data
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Real-time stock prices and market data directly from NSE India
              </p>
              <div className="absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-linear-to-br from-violet-500/20 to-purple-600/20 blur-2xl transition-all group-hover:scale-150" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 text-2xl shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl">
                👨‍👩‍👧‍👦
              </div>
              <h2 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Family Tracking
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Manage investments for your entire family in one place
              </p>
              <div className="absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-linear-to-br from-purple-500/20 to-indigo-600/20 blur-2xl transition-all group-hover:scale-150" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 text-2xl shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl">
                💼
              </div>
              <h2 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Multi-Asset
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                Track all your investments: stocks, MFs, ETFs, FDs, and more
              </p>
              <div className="absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-linear-to-br from-indigo-500/20 to-blue-600/20 blur-2xl transition-all group-hover:scale-150" />
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-lg backdrop-blur-lg transition-all hover:-translate-y-2 hover:shadow-2xl dark:bg-gray-900/60">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-cyan-600 text-2xl shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:text-3xl">
                📈
              </div>
              <h2 className="mb-2 text-lg font-bold text-gray-900 sm:mb-3 sm:text-xl dark:text-white">
                Smart Analytics
              </h2>
              <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                AI-powered insights with consolidated portfolio views
              </p>
              <div className="absolute -right-2 -bottom-2 h-24 w-24 rounded-full bg-linear-to-br from-blue-500/20 to-cyan-600/20 blur-2xl transition-all group-hover:scale-150" />
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative mx-4 overflow-hidden rounded-3xl border border-violet-200/50 bg-white/60 p-6 text-center shadow-2xl backdrop-blur-lg sm:p-8 md:p-10 lg:p-12 dark:border-violet-700/30 dark:bg-gray-900/60">
            <div className="absolute -top-1/4 -left-1/4 h-64 w-64 rounded-full bg-linear-to-br from-violet-500/20 to-purple-600/20 blur-3xl sm:h-96 sm:w-96" />
            <div className="absolute -right-1/4 -bottom-1/4 h-64 w-64 rounded-full bg-linear-to-br from-indigo-500/20 to-blue-600/20 blur-3xl sm:h-96 sm:w-96" />
            <div className="relative z-10">
              <h3 className="mb-3 bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text font-['Space_Grotesk'] text-2xl font-bold text-transparent sm:mb-4 sm:text-3xl md:text-4xl">
                Ready to Take Control?
              </h3>
              <p className="mx-auto mb-6 max-w-2xl px-4 text-sm text-gray-600 sm:mb-8 sm:text-base md:text-lg dark:text-gray-300">
                Join thousands of investors who trust WealthFlow to manage their Indian investment
                portfolios
              </p>
              <div className="flex flex-col flex-wrap justify-center gap-3 px-4 sm:flex-row sm:gap-4">
                <Link
                  href="/signup"
                  className="group relative overflow-hidden rounded-2xl bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl sm:px-8 sm:py-4"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-linear-to-r from-violet-700 via-purple-700 to-indigo-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-2xl border-2 border-violet-600 px-6 py-3 font-semibold text-violet-600 transition-all hover:bg-violet-50 sm:px-8 sm:py-4 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-950/30"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
