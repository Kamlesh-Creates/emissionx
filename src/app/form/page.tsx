'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface ValidationErrors {
  [key: string]: string;
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const router = useRouter();

  // Real-time validation function
  const validateField = useCallback((section: keyof CarbonFormData, field: string, value: number): string | null => {
    // Transport validation
    if (section === 'transport') {
      if (field === 'carKm') {
        if (value < 0) return 'Car distance cannot be negative';
        if (value > 1000) return 'Car distance seems unrealistic (max 1000 km/day)';
      }
      if (field === 'busKm') {
        if (value < 0) return 'Bus distance cannot be negative';
        if (value > 500) return 'Bus distance seems unrealistic (max 500 km/day)';
      }
      if (field === 'flightsHours') {
        if (value < 0) return 'Flight hours cannot be negative';
        if (value > 200) return 'Flight hours seem unrealistic (max 200 hours/month)';
      }
    }
    
    // Electricity validation
    if (section === 'electricity' && field === 'unitsPerMonth') {
      if (value < 0) return 'Electricity units cannot be negative';
      if (value > 5000) return 'Electricity usage seems unrealistic (max 5000 units/month)';
    }
    
    // LPG validation
    if (section === 'lpg' && field === 'cylindersPerMonth') {
      if (value < 0) return 'LPG cylinders cannot be negative';
      if (value > 10) return 'LPG usage seems unrealistic (max 10 cylinders/month)';
    }
    
    // Purchases validation
    if (section === 'purchases' && field === 'monthlySpend') {
      if (value < 0) return 'Monthly spend cannot be negative';
      if (value > 1000000) return 'Monthly spend seems unrealistic (max ₹10,00,000)';
    }
    
    return null;
  }, []);

  // Full form validation function
  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Transport validation
    const carKmError = validateField('transport', 'carKm', formData.transport.carKm);
    if (carKmError) errors.carKm = carKmError;
    
    const busKmError = validateField('transport', 'busKm', formData.transport.busKm);
    if (busKmError) errors.busKm = busKmError;
    
    const flightsHoursError = validateField('transport', 'flightsHours', formData.transport.flightsHours);
    if (flightsHoursError) errors.flightsHours = flightsHoursError;
    
    // Electricity validation
    const unitsError = validateField('electricity', 'unitsPerMonth', formData.electricity.unitsPerMonth);
    if (unitsError) errors.unitsPerMonth = unitsError;
    
    // LPG validation
    const cylindersError = validateField('lpg', 'cylindersPerMonth', formData.lpg.cylindersPerMonth);
    if (cylindersError) errors.cylindersPerMonth = cylindersError;
    
    // Purchases validation
    const spendError = validateField('purchases', 'monthlySpend', formData.purchases.monthlySpend);
    if (spendError) errors.monthlySpend = spendError;
    
    return errors;
  }, [formData, validateField]);

  const handleInputChange = useCallback((section: keyof CarbonFormData, field: string, value: string | number) => {
    // Parse number values properly
    const parsedValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    // Clear general error
    if (error) setError(null);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, string | number>),
        [field]: parsedValue,
      },
    }));
    
    // Real-time validation
    const fieldError = validateField(section, field, parsedValue);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, [error, validateField]);

  // Special handler for diet selection
  const handleDietChange = useCallback((dietValue: 'veg' | 'non-veg') => {
    setFormData(prev => ({
      ...prev,
      diet: dietValue,
    }));
    
    // Clear any diet-related validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.diet;
      return newErrors;
    });
    
    if (error) setError(null);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setIsLoading(false);
      setError('Please fix the validation errors before submitting');
      return;
    }

    try {
      const response = await fetch('/api/carbon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable input component
  const NumberInput = ({ 
    label, 
    value, 
    onChange, 
    placeholder = "0", 
    unit = "", 
    min = 0, 
    max, 
    step = "0.1",
    field,
    helpText 
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: string;
    field: string;
    helpText?: string;
  }) => {
    const hasError = validationErrors[field];
    const [localValue, setLocalValue] = useState(value.toString());
    const [isFocused, setIsFocused] = useState(false);
    
    // Only sync with parent value when not focused (prevents cursor jumping)
    useEffect(() => {
      if (!isFocused) {
        setLocalValue(value.toString());
      }
    }, [value, isFocused]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setLocalValue(inputValue);
      
      // Only update parent if it's a valid number
      if (inputValue === '' || !isNaN(parseFloat(inputValue))) {
        const numValue = inputValue === '' ? 0 : parseFloat(inputValue);
        onChange(numValue);
      }
    };
    
    const handleFocus = () => {
      setIsFocused(true);
    };
    
    const handleBlur = () => {
      setIsFocused(false);
      
      // Ensure we have a valid number on blur
      const numValue = parseFloat(localValue);
      if (isNaN(numValue) || numValue < min) {
        const correctedValue = min;
        setLocalValue(correctedValue.toString());
        onChange(correctedValue);
      } else if (max && numValue > max) {
        const correctedValue = max;
        setLocalValue(correctedValue.toString());
        onChange(correctedValue);
      } else {
        // Update with the final valid number
        setLocalValue(numValue.toString());
        onChange(numValue);
      }
    };
    
    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {unit && <span className="text-gray-500 font-normal"> ({unit})</span>}
        </label>
        <div className="relative">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full px-4 py-3 pr-20 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-black placeholder-gray-400 ${
              hasError 
                ? 'border-red-300 bg-red-50 focus:border-red-500' 
                : 'border-gray-200 bg-white hover:border-gray-300 focus:border-green-500'
            }`}
            placeholder={placeholder}
            style={{
              MozAppearance: 'textfield',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          
          {/* Increment/Decrement Buttons */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
            <button
              type="button"
              onClick={() => {
                const currentValue = parseFloat(localValue) || 0;
                // Use different step sizes based on the field
                const stepSize = field === 'monthlySpend' ? 100 : parseFloat(step);
                const newValue = Math.min(currentValue + stepSize, max || Infinity);
                setLocalValue(newValue.toString());
                onChange(newValue);
              }}
              className="w-6 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t transition-colors duration-200"
              disabled={!!max && parseFloat(localValue) >= max}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => {
                const currentValue = parseFloat(localValue) || 0;
                // Use different step sizes based on the field
                const stepSize = field === 'monthlySpend' ? 100 : parseFloat(step);
                const newValue = Math.max(currentValue - stepSize, min);
                setLocalValue(newValue.toString());
                onChange(newValue);
              }}
              className="w-6 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-b transition-colors duration-200"
              disabled={parseFloat(localValue) <= min}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {unit && (
            <span className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">
              {unit}
            </span>
          )}
        </div>
        {helpText && !hasError && (
          <p className="mt-1 text-xs text-gray-500">{helpText}</p>
        )}
        {hasError && (
          <p className="mt-1 text-xs text-red-600 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {hasError}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-gray-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200 group"
          >
            <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Carbon Footprint Calculator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Enter your daily activities to get an accurate estimate of your CO₂ emissions and discover ways to reduce your environmental impact.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Activity Information
            </h2>
            <p className="text-green-100 text-sm mt-1">Fill in the details about your daily activities</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Transport Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-green-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Transportation</h3>
                  <p className="text-sm text-gray-600">Daily travel and commuting</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NumberInput
                  label="Personal Car"
                  value={formData.transport.carKm}
                  onChange={(value) => handleInputChange('transport', 'carKm', value)}
                  unit="km/day"
                  field="carKm"
                  helpText="Distance traveled by personal car daily"
                  max={1000}
                  step="1"
                />
                <NumberInput
                  label="Public Bus"
                  value={formData.transport.busKm}
                  onChange={(value) => handleInputChange('transport', 'busKm', value)}
                  unit="km/day"
                  field="busKm"
                  helpText="Distance traveled by bus daily"
                  max={500}
                />
                <NumberInput
                  label="Air Travel"
                  value={formData.transport.flightsHours}
                  onChange={(value) => handleInputChange('transport', 'flightsHours', value)}
                  unit="hours/month"
                  field="flightsHours"
                  helpText="Total flight hours per month"
                  max={200}
                  step="0.5"
                />
              </div>
            </div>

            {/* Electricity Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-blue-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Electricity Consumption</h3>
                  <p className="text-sm text-gray-600">Monthly household electricity usage</p>
                </div>
              </div>
              <div className="max-w-md">
                <NumberInput
                  label="Electricity Units"
                  value={formData.electricity.unitsPerMonth}
                  onChange={(value) => handleInputChange('electricity', 'unitsPerMonth', value)}
                  unit="kWh/month"
                  field="unitsPerMonth"
                  helpText="Check your electricity bill for monthly units"
                  max={5000}
                  step="1"
                />
              </div>
            </div>

            {/* LPG Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-orange-100">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">LPG Consumption</h3>
                  <p className="text-sm text-gray-600">Cooking gas usage</p>
                </div>
              </div>
              <div className="max-w-md">
                <NumberInput
                  label="LPG Cylinders"
                  value={formData.lpg.cylindersPerMonth}
                  onChange={(value) => handleInputChange('lpg', 'cylindersPerMonth', value)}
                  unit="cylinders/month"
                  field="cylindersPerMonth"
                  helpText="Number of 14.2kg cylinders used monthly"
                  max={10}
                  step="0.1"
                />
              </div>
            </div>

            {/* Diet Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-purple-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🍽️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Dietary Preference</h3>
                  <p className="text-sm text-gray-600">Your primary diet type</p>
                </div>
              </div>
              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diet Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.diet === 'veg' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="diet"
                      value="veg"
                      checked={formData.diet === 'veg'}
                      onChange={() => handleDietChange('veg')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="text-2xl block mb-1">🥬</span>
                      <span className="font-medium">Vegetarian</span>
                    </div>
                    {formData.diet === 'veg' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                  <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    formData.diet === 'non-veg' 
                      ? 'border-green-500 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="diet"
                      value="non-veg"
                      checked={formData.diet === 'non-veg'}
                      onChange={() => handleDietChange('non-veg')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="text-2xl block mb-1">🥩</span>
                      <span className="font-medium">Non-Vegetarian</span>
                    </div>
                    {formData.diet === 'non-veg' && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Purchases Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-yellow-100">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🛒</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Monthly Purchases</h3>
                  <p className="text-sm text-gray-600">Shopping and consumption spending</p>
                </div>
              </div>
              <div className="max-w-md">
                <NumberInput
                  label="Monthly Spending"
                  value={formData.purchases.monthlySpend}
                  onChange={(value) => handleInputChange('purchases', 'monthlySpend', value)}
                  unit="₹"
                  field="monthlySpend"
                  helpText="Total spending on goods and services monthly"
                  max={1000000}
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Form Progress Indicator */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Form Progress</span>
                <span className="text-sm text-gray-500">
                  {Object.keys(validationErrors).length === 0 ? 'Ready to submit' : `${Object.keys(validationErrors).length} error(s) to fix`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    Object.keys(validationErrors).length === 0 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${Math.max(20, 100 - (Object.keys(validationErrors).length * 15))}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || Object.keys(validationErrors).length > 0}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating Your Footprint...
                  </div>
                ) : Object.keys(validationErrors).length > 0 ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Fix Errors to Continue
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Calculate My Carbon Footprint
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Display */}
        {result && (
          <div id="results-section" className="max-w-3xl mx-auto mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Your Carbon Footprint Results
              </h3>
              <p className="text-green-100 text-sm mt-1">Based on your submitted activity data</p>
            </div>

            <div className="p-8">
              {/* Total Emissions Card */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Monthly CO₂ Emissions</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {result.totalEmissions.toFixed(2)} 
                      <span className="text-lg font-medium text-gray-600 ml-2">kg CO₂</span>
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Environmental Context */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {result.totalEmissions < 100 ? (
                      <span className="text-green-600 font-medium">🌱 Great job! Your footprint is below average.</span>
                    ) : result.totalEmissions < 300 ? (
                      <span className="text-yellow-600 font-medium">⚡ Your footprint is moderate. Room for improvement!</span>
                    ) : (
                      <span className="text-red-600 font-medium">🚨 Your footprint is high. Consider reducing activities.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Breakdown by Category */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Emissions Breakdown
                </h4>
                <div className="space-y-4">
                  {Object.entries(result.breakdown).map(([category, emissions]) => {
                    const percentage = result.totalEmissions > 0 ? (emissions / result.totalEmissions * 100) : 0;
                    const categoryIcons: Record<string, string> = {
                      transport: '🚗',
                      electricity: '⚡',
                      lpg: '🔥',
                      diet: '🍽️',
                      purchases: '🛒'
                    };
                    const categoryColors: Record<string, string> = {
                      transport: 'bg-blue-500',
                      electricity: 'bg-yellow-500',
                      lpg: 'bg-orange-500',
                      diet: 'bg-purple-500',
                      purchases: 'bg-pink-500'
                    };
                    
                    return (
                      <div key={category} className="flex items-center space-x-4">
                        <span className="text-lg">{categoryIcons[category]}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {category}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-gray-900">
                                {emissions.toFixed(2)} kg CO₂
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${categoryColors[category]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Reduction Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">🚗 Transportation</h5>
                    <p className="text-sm text-gray-600">
                      Consider carpooling, using public transport, or switching to electric vehicles.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">⚡ Energy Use</h5>
                    <p className="text-sm text-gray-600">
                      Use LED bulbs, unplug devices, and consider solar energy options.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">🍽️ Diet Impact</h5>
                    <p className="text-sm text-gray-600">
                      Reduce meat consumption, buy local produce, and minimize food waste.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">🛒 Conscious Consumption</h5>
                    <p className="text-sm text-gray-600">
                      Buy only what you need, choose sustainable products, and recycle.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Success Message */}
              {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-green-600">{saveSuccess}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  onClick={async () => {
                    const userId = localStorage.getItem('userId');
                    if (!userId) {
                      setError('Please login to save your footprint to your profile');
                      router.push('/auth');
                      return;
                    }

                    if (!result) {
                      setError('No calculation results to save');
                      return;
                    }

                    setIsSaving(true);
                    setError(null);
                    setSaveSuccess(null);

                    try {
                      // Create activities for each category that has emissions
                      const activities = [];
                      const timestamp = new Date();

                      // Transport activity
                      if (result.breakdown.transport > 0) {
                        const carKm = formData.transport.carKm * 30; // Monthly
                        const busKm = formData.transport.busKm * 30; // Monthly
                        const flightKm = formData.transport.flightsHours * 800; // Approx km

                        if (carKm > 0 || busKm > 0 || flightKm > 0) {
                          activities.push({
                            userId,
                            type: 'transport',
                            category: 'car',
                            data: {
                              distance: carKm,
                              vehicleType: 'car',
                              fuelType: 'petrol',
                              passengers: 1
                            },
                            timestamp
                          });
                        }
                      }

                      // Electricity activity
                      if (result.breakdown.electricity > 0 && formData.electricity.unitsPerMonth > 0) {
                        activities.push({
                          userId,
                          type: 'electricity',
                          category: 'electricity_consumption',
                          data: {
                            units: formData.electricity.unitsPerMonth,
                            appliance: 'home'
                          },
                          timestamp
                        });
                      }

                      // LPG activity
                      if (result.breakdown.lpg > 0 && formData.lpg.cylindersPerMonth > 0) {
                        activities.push({
                          userId,
                          type: 'lpg',
                          category: 'lpg_usage',
                          data: {
                            cylinders: formData.lpg.cylindersPerMonth,
                            cylinderSize: 14.2
                          },
                          timestamp
                        });
                      }

                      // Diet activity
                      if (result.breakdown.diet > 0) {
                        // Use representative food types for calculation
                        // For vegetarian: use vegetables as base
                        // For non-vegetarian: use chicken as representative
                        activities.push({
                          userId,
                          type: 'diet',
                          category: 'food_consumption',
                          data: {
                            foodType: formData.diet === 'veg' ? 'vegetables' : 'chicken',
                            quantity: formData.diet === 'veg' ? 15 : 25, // Approximate monthly kg
                            mealType: 'lunch'
                          },
                          timestamp
                        });
                      }

                      // Purchases activity
                      if (result.breakdown.purchases > 0 && formData.purchases.monthlySpend > 0) {
                        activities.push({
                          userId,
                          type: 'purchases',
                          category: 'shopping',
                          data: {
                            amount: formData.purchases.monthlySpend,
                            category: 'general',
                            item: 'monthly_purchases'
                          },
                          timestamp
                        });
                      }

                      // Save all activities
                      const savePromises = activities.map(async (activity, index) => {
                        const response = await fetch('/api/activities', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(activity),
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          return {
                            index,
                            activity,
                            error: errorData.details || errorData.error || `HTTP ${response.status}`,
                            response
                          };
                        }
                        return { index, activity, success: true };
                      });

                      const results = await Promise.all(savePromises);
                      const failedSaves = results.filter((result) => {
                        return 'error' in result && !('success' in result);
                      }) as Array<{ index: number; activity: { type?: string; category?: string }; error: string }>;

                      if (failedSaves.length > 0) {
                        const errorMessages = failedSaves.map((failure) => {
                          const type = failure.activity?.type || 'unknown';
                          const category = failure.activity?.category || 'unknown';
                          return `${type}/${category}: ${failure.error}`;
                        });
                        throw new Error(`Failed to save ${failedSaves.length} activity(ies): ${errorMessages.join('; ')}`);
                      }

                      // Update user's total emissions
                      const userUpdateResponse = await fetch(`/api/users/${userId}`, {
                        method: 'PATCH',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          totalEmissions: result.totalEmissions
                        }),
                      });

                      if (!userUpdateResponse.ok) {
                        console.warn('Failed to update user emissions, but activities were saved');
                      }

                      setSaveSuccess('Your carbon footprint has been saved to your profile!');
                      
                      // Redirect to profile after a short delay
                      setTimeout(() => {
                        router.push('/profile');
                      }, 1500);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Failed to save to profile. Please try again.');
                      console.error('Save error:', err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving || !result}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save to Profile</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setSaveSuccess(null);
                    setFormData({
                      transport: { carKm: 0, busKm: 0, flightsHours: 0 },
                      electricity: { unitsPerMonth: 0 },
                      lpg: { cylindersPerMonth: 0 },
                      diet: 'veg',
                      purchases: { monthlySpend: 0 }
                    });
                    setValidationErrors({});
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
                >
                  Calculate Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}