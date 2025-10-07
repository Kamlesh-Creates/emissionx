'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Types for our data
interface User {
  _id: string;
  name: string;
  email: string;
  stats: {
    totalEmissions: number;
    monthlyAverage: number;
    yearlyTotal: number;
    streak: number;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      category: string;
      rarity: string;
      unlockedAt: string;
    }>;
  };
  createdAt: string;
}

interface Activity {
  _id: string;
  type: string;
  category: string;
  emissions: {
    totalCO2e: number;
  };
  timestamp: string;
  createdAt: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format category names
const formatCategory = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to get category emoji
const getCategoryEmoji = (category: string) => {
  const emojiMap: Record<string, string> = {
    'transport': '🚗',
    'electricity': '⚡',
    'lpg': '🔥',
    'diet': '🍽️',
    'purchases': '🛒',
    'waste': '🗑️',
    'water': '💧',
    'heating': '🌡️',
    'cooling': '❄️',
    'other': '📊'
  };
  return emojiMap[category] || '📊';
};

// Helper function to get rarity color
const getRarityColor = (rarity: string) => {
  const colorMap: Record<string, string> = {
    'common': 'text-gray-600 bg-gray-100',
    'rare': 'text-blue-600 bg-blue-100',
    'epic': 'text-purple-600 bg-purple-100',
    'legendary': 'text-yellow-600 bg-yellow-100'
  };
  
  return colorMap[rarity] || 'text-gray-600 bg-gray-100';
};

// Fetch user data
async function getUserData(userId: string): Promise<User | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/users/${userId}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch user data:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Fetch user activities
async function getUserActivities(userId: string): Promise<Activity[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/users/${userId}/activities?limit=5`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch user activities:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.activities;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Get userId from localStorage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          // No user ID found, redirect to auth
          router.push('/auth');
          return;
        }

        // Fetch user data and activities in parallel
        const [userData, activitiesData] = await Promise.all([
          getUserData(userId),
          getUserActivities(userId)
        ]);

        if (!userData) {
          setError('User not found. Please try logging in again.');
          return;
        }

        setUser(userData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 animate-pulse">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Profile card skeleton */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/auth"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
            <div className="text-yellow-600 text-lg font-semibold mb-2">No Profile Found</div>
            <p className="text-yellow-700 mb-4">Please log in to view your profile.</p>
            <Link
              href="/auth"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Track your carbon footprint journey</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            {/* Avatar */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* User Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          {/* Total Emissions */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium mb-1">Total CO₂ Emissions</div>
            <div className="text-3xl font-bold text-green-700">
              {user.stats.totalEmissions.toFixed(2)} kg CO₂e
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 font-medium mb-1">Monthly Average</div>
            <div className="text-2xl font-bold text-gray-900">
              {user.stats.monthlyAverage.toFixed(2)} kg CO₂e
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 font-medium mb-1">Current Streak</div>
            <div className="text-2xl font-bold text-gray-900">
              {user.stats.streak} days
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm text-gray-600 font-medium mb-1">Yearly Total</div>
            <div className="text-2xl font-bold text-gray-900">
              {user.stats.yearlyTotal.toFixed(2)} kg CO₂e
            </div>
          </div>
        </div>

        {/* Achievements */}
        {user.stats.achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.stats.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <div className="font-semibold">{achievement.title}</div>
                      <div className="text-sm opacity-75">{achievement.description}</div>
                      <div className="text-xs mt-1">
                        Unlocked: {formatDate(achievement.unlockedAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Recent Activities</h3>
          
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📈</div>
              <p className="text-gray-600 mb-4">No activities recorded yet</p>
              <Link
                href="/form"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Tracking
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CO₂ Emitted</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(activity.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryEmoji(activity.type)}</span>
                          <span className="text-gray-700">{formatCategory(activity.category)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {activity.emissions.totalCO2e.toFixed(2)} kg CO₂e
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link
            href="/form"
            className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Activity
          </Link>
        </div>
      </div>
    </div>
  );
}