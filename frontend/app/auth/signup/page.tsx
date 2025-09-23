'use client';

// StageFlow - Registration Page
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  tenantName: string;
  tenantSubdomain: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    tenantName: '',
    tenantSubdomain: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate subdomain from organization name
    if (name === 'tenantName') {
      const subdomain = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
      setFormData(prev => ({ ...prev, tenantSubdomain: subdomain }));
      setSubdomainAvailable(null);
    }

    // Check subdomain availability when user types
    if (name === 'tenantSubdomain' && value.length >= 3) {
      checkSubdomainAvailability(value);
    }
  };

  const checkSubdomainAvailability = async (subdomain: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-subdomain/${subdomain}`);
      const data = await response.json();
      setSubdomainAvailable(data.available);
    } catch (error) {
      console.error('Error checking subdomain:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          tenantName: formData.tenantName,
          tenantSubdomain: formData.tenantSubdomain
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('stageflow_token', data.data.token);
        localStorage.setItem('stageflow_user', JSON.stringify(data.data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-4xl font-bold text-[#392F60]">
            StageFlow
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your 30-day free trial today
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Personal Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                placeholder="john@example.com"
              />
            </div>

            {/* Organization Information */}
            <div>
              <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                id="tenantName"
                name="tenantName"
                type="text"
                required
                value={formData.tenantName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                placeholder="First Baptist Church"
              />
            </div>

            <div>
              <label htmlFor="tenantSubdomain" className="block text-sm font-medium text-gray-700">
                Subdomain
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  id="tenantSubdomain"
                  name="tenantSubdomain"
                  type="text"
                  required
                  value={formData.tenantSubdomain}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                  placeholder="firstbaptist"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  .stageflow.app
                </span>
              </div>
              {subdomainAvailable === true && (
                <p className="mt-1 text-sm text-green-600">✅ Subdomain available</p>
              )}
              {subdomainAvailable === false && (
                <p className="mt-1 text-sm text-red-600">❌ Subdomain not available</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#392F60] focus:border-[#392F60]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || subdomainAvailable === false}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#392F60] hover:bg-[#2d2448] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#392F60] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-[#392F60] hover:text-[#2d2448]">
                Sign in
              </Link>
            </p>
          </div>
        </form>

        {/* OAuth Options */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Google
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}