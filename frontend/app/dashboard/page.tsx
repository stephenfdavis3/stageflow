'use client';

// StageFlow - Dashboard Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    subscriptionTier: string;
    trialEndsAt?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('stageflow_token');
      const userData = localStorage.getItem('stageflow_user');

      if (!token || !userData) {
        router.push('/auth/login');
        return;
      }

      try {
        // Verify token with backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          // Token invalid, redirect to login
          localStorage.removeItem('stageflow_token');
          localStorage.removeItem('stageflow_user');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('stageflow_token');
    localStorage.removeItem('stageflow_user');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#392F60] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const trialDaysLeft = user.tenant.trialEndsAt 
    ? Math.ceil((new Date(user.tenant.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#392F60]">StageFlow</h1>
              <span className="ml-4 text-sm text-gray-500">
                {user.tenant.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      {user.tenant.subscriptionTier === 'TRIAL' && trialDaysLeft !== null && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Free Trial:</strong> {trialDaysLeft} days remaining.{' '}
                <a href="#" className="font-medium underline text-yellow-700 hover:text-yellow-600">
                  Upgrade now
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome to StageFlow
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Manage your church services and schedules all in one place.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📅</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Upcoming Services
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">3</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎵</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Songs in Library
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">45</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Team Members
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">8</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📄</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bulletins Created
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">12</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl mb-4">📅</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Plan a Service
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new service schedule with songs, readings, and timing.
                </p>
                <button 
				  onClick={() => router.push('/services/new')}
				  className="bg-[#392F60] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2d2448] transition-colors"
				  >
				  Create Service
				</button>

				# Also update the "Service Library" button to go to services list:
				<button 
				  onClick={() => router.push('/services')}
				  className="bg-[#392F60] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2d2448] transition-colors"
				>
				  Manage Services
				</button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl mb-4">🎵</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Manage Songs
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add new songs to your library or edit existing ones.
                </p>
                <button className="bg-[#392F60] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2d2448] transition-colors">
                  Song Library
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl mb-4">📄</div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Export Bulletin
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Generate PDF or Word bulletins for your upcoming services.
                </p>
                <button className="bg-[#392F60] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#2d2448] transition-colors">
                  Create Bulletin
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="bg-white shadow rounded-lg">
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-4">🎭</div>
                  <p>Welcome to StageFlow!</p>
                  <p className="text-sm mt-2">
                    Start by creating your first service or adding songs to your library.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}