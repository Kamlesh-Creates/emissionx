'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CarbonFormData {
  transport: {
    carKm: number;
    busKm: number;
    flightsHours: number;
  };
  electricity: {
    unitsPerMonth: number;
  };
  lpg: {
    cylindersPerMonth: number;
  };
  diet: 'veg' | 'non-veg';
  purchases: {
    monthlySpend: number;
  };
}

interface CarbonResult {
  totalEmissions: number;
  breakdown: {
    transport: number;
    electricity: number;
    lpg: number;
    diet: number;
    purchases: number;
  };
  message: string;
}

export default function CarbonFootprintCalculator() {
  const [formData, setFormData] = useState<CarbonFormData>({
    transport: {
      carKm: 0,
      busKm: 0,
      flightsHours: 0,
    },
    electricity: {
      unitsPerMonth: 0,
    },
    lpg: {
      cylindersPerMonth: 0,
    },
    diet: 'veg',
    purchases: {
      monthlySpend: 0,
    },
  });

  const [result, setResult] = useState<CarbonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (section: keyof CarbonFormData, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string | number>),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate emissions');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
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

        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-600 text-lg">
            Enter your daily activities to estimate your CO₂ emissions.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Transport Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                🚗 Transport
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car (km/day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.transport.carKm}
                    onChange={(e) => handleInputChange('transport', 'carKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus (km/day)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.transport.busKm}
                    onChange={(e) => handleInputChange('transport', 'busKm', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flights (hours/month)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.transport.flightsHours}
                    onChange={(e) => handleInputChange('transport', 'flightsHours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Electricity Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                ⚡ Electricity
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units consumed per month
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.electricity.unitsPerMonth}
                  onChange={(e) => handleInputChange('electricity', 'unitsPerMonth', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* LPG Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                🔥 LPG
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cylinders per month
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.lpg.cylindersPerMonth}
                  onChange={(e) => handleInputChange('lpg', 'cylindersPerMonth', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Diet Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                🍽️ Diet
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary preference
                </label>
                <select
                  value={formData.diet}
                  onChange={(e) => handleInputChange('diet', 'diet', e.target.value as 'veg' | 'non-veg')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            {/* Purchases Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                🛒 Purchases
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly spend (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.purchases.monthlySpend}
                  onChange={(e) => handleInputChange('purchases', 'monthlySpend', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {isLoading ? 'Calculating...' : 'Calculate Emissions'}
            </button>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">📊 Your Carbon Footprint Results</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-200">
                  <span className="font-medium text-green-700">Total CO₂ Emissions:</span>
                  <span className="text-xl font-bold text-green-800">
                    {result.totalEmissions.toFixed(2)} kg CO₂/month
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Transport: {result.breakdown.transport.toFixed(2)} kg</div>
                  <div>Electricity: {result.breakdown.electricity.toFixed(2)} kg</div>
                  <div>LPG: {result.breakdown.lpg.toFixed(2)} kg</div>
                  <div>Diet: {result.breakdown.diet.toFixed(2)} kg</div>
                  <div>Purchases: {result.breakdown.purchases.toFixed(2)} kg</div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border">
                  <h4 className="font-medium text-gray-800 mb-2">Raw JSON Response:</h4>
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
