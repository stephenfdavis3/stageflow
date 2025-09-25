'use client';

// StageFlow - Services List Page
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  dayOfWeek: number;
  startTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  tenant: {
    name: string;
  };
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
  'Thursday', 'Friday', 'Saturday'
];

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndLoadServices = async () => {
      const token = localStorage.getItem('stageflow_token');
      const userData = localStorage.getItem('stageflow_user');

      if (!token || !userData) {
        router.push('/auth/login');
        return;
      }

      try {
        setUser(JSON.parse(userData));
        await loadServices(token);
      } catch (error) {
        console.error('Error loading page:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndLoadServices();
  }, [router]);

  const loadServices = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data.data.services);
      } else if (response.status === 401) {
        localStorage.removeItem('stageflow_token');
        localStorage.removeItem('stageflow_user');
        router.push('/auth/login');
      } else {
        setError('Failed to load services');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Network error loading services');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const token = localStorage.getItem('stageflow_token');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Reload services to get updated status
        await loadServices(token);
      } else {
        setError('Failed to update service status');
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      setError('Network error updating service');
    }
  };

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
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-2xl font-bold text-[#392F60]">
                StageFlow
              </Link>
              <nav className="flex space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/services" className="text-[#392F60] px-3 py-2 text-sm font-medium border-b-2 border-[#392F60]">
                  Services
                </Link>
                <Link href="/schedules" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                  Schedules
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name} • {user?.tenant.name}
              </span>
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="sm:flex sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Service Management
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Create and manage your church service templates.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/services/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#392F60] hover:bg-[#2d2448] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#392F60]"
              >
                Add New Service
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Services List */}
          {services.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No services yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first service template to get started with scheduling.
              </p>
              <Link
                href="/services/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#392F60] hover:bg-[#2d2448]"
              >
                Create Your First Service
              </Link>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {services.map((service) => (
                  <li key={service.id}>
                    <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            service.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            📅
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-lg font-medium text-gray-900">
                              {service.name}
                            </p>
                            {!service.isActive && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {DAYS_OF_WEEK[service.dayOfWeek]} at {service.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleServiceStatus(service.id)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                            service.isActive
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link
                          href={`/services/${service.id}/edit`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/services/${service.id}`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-[#392F60] bg-purple-100 hover:bg-purple-200"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Stats */}
          {services.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">📊</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Services
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {services.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">✅</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Active Services
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {services.filter(s => s.isActive).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">📅</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Weekly Services
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {services.filter(s => s.isActive).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}