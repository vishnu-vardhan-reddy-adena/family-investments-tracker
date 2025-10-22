export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-center text-5xl font-bold text-gray-900 dark:text-white">
            Portfolio Tracker
          </h1>
          <p className="mb-12 text-center text-xl text-gray-600 dark:text-gray-300">
            Track your Indian investments - Stocks, MFs, ETFs, FDs, NPS, EPFO & Real Estate
          </p>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                📊 Live NSE Data
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time stock prices and market data from NSE India
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                👨‍👩‍👧‍👦 Family Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage investments for you and your family members
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                💼 Multiple Assets
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Track stocks, mutual funds, ETFs, FDs, NPS, EPFO, and more
              </p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">
                📈 Consolidated View
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                View portfolios individually or consolidated across family
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
            <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
              Getting Started
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Sign up now and start tracking your investments!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/signup"
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Get Started Free
              </a>
              <a
                href="/login"
                className="rounded-lg bg-gray-600 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
