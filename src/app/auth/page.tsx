'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type AuthMode = 'register' | 'login';

interface RegisterFormData {
  name: string;
  email: string;
}

interface LoginFormData {
  email: string;
}

interface AuthResponse {
  userId: string;
  message?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('register');
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    name: '',
    email: '',
  });
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegisterInputChange = (field: keyof RegisterFormData, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleLoginInputChange = (field: keyof LoginFormData, value: string) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save userId to localStorage
      localStorage.setItem('userId', data.userId);
      setSuccess(data.message || 'Registration successful!');
      
      // Redirect to profile after a brief delay
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save userId to localStorage
      localStorage.setItem('userId', data.userId);
      setSuccess(data.message || 'Login successful!');
      
      // Redirect to profile after a brief delay
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    // Reset forms
    setRegisterData({ name: '', email: '' });
    setLoginData({ email: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to EmissionX
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'register' 
              ? 'Create an account to track your carbon footprint'
              : 'Login to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 ${
                mode === 'register'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 px-4 text-center font-medium transition-colors duration-200 ${
                mode === 'login'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
          </div>

          {/* Register Form */}
          {mode === 'register' && (
            <form className="space-y-6" onSubmit={handleRegister}>
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => handleRegisterInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Email Input */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => handleLoginInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              {/* Switch to Register */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-medium text-green-600 hover:text-green-700"
                  >
                    Register here
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Back to Home Link */}
          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <Link
              href="/"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>By continuing, you agree to track your carbon footprint responsibly.</p>
        </div>
      </div>
    </div>
  );
}
