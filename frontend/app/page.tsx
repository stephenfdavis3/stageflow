// StageFlow Frontend - Landing Page
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          {/* Logo Placeholder */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-[#392F60]">
              StageFlow
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Church service scheduling made simple
            </p>
          </div>

          {/* Hero Section */}
          <div className="max-w-3xl mx-auto mt-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Orchestrating worship, one service at a time 🎵
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              StageFlow helps churches plan and coordinate services seamlessly.
              Schedule services, manage song lists, and create bulletins all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <a 
                href="/auth/signup"
                className="bg-[#392F60] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2d2448] transition-colors"
              >
                Start Free Trial
              </a>
              <a 
                href="/auth/login"
                className="border-2 border-[#392F60] text-[#392F60] px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Multi-Service Scheduling
              </h3>
              <p className="text-gray-600">
                Plan and coordinate multiple services with ease
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                iTunes Integration
              </h3>
              <p className="text-gray-600">
                Search and include song information automatically
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Export Bulletins
              </h3>
              <p className="text-gray-600">
                Generate PDF and Word documents instantly
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="mt-16 text-sm text-gray-500">
            <p>🚀 Version 1.0.0 - Development Mode</p>
            <p className="mt-2">
              API Status: <span className="text-green-600 font-semibold">Connected</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}