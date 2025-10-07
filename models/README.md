# MongoDB Models for EmissionX

This directory contains MongoDB models and utilities for the EmissionX carbon footprint tracking application.

## Directory Structure

```
models/
├── users.ts          # User model with MongoDB schema
├── activity.ts       # Activity model with emission calculations
├── mongodb.ts        # Database connection utility
├── index.ts          # Centralized exports
└── README.md         # This documentation
```

## Models

### User Model (`users.ts`)

The User model represents users in the system with comprehensive profile, preferences, and statistics.

#### Features:
- **Profile Management**: Personal info, location, lifestyle preferences
- **Preferences**: Theme, units, notifications, privacy settings
- **Statistics**: Emissions tracking, achievements, streaks
- **Goals**: Monthly and yearly emission targets

#### Usage:
```typescript
import { User, connectDB } from '@/models';

// Connect to database
await connectDB();

// Create a new user
const user = new User({
  name: 'John Doe',
  email: 'john@example.com'
});
await user.save();

// Update user emissions
await user.updateEmissions(25.5);

// Add achievement
await user.addAchievement({
  id: 'first_calculation',
  title: 'First Calculation',
  description: 'Completed your first carbon footprint calculation',
  icon: '🌱',
  category: 'milestone',
  rarity: 'common'
});

// Find user by email
const foundUser = await User.findByEmail('john@example.com');

// Get top emitters
const topUsers = await User.findTopEmitters(10);
```

### Activity Model (`activity.ts`)

The Activity model tracks individual carbon footprint activities with automatic emission calculations.

#### Features:
- **Multiple Activity Types**: Transport, electricity, LPG, diet, purchases, waste, water
- **Automatic Calculations**: Emissions calculated based on activity type and data
- **Flexible Data Structure**: Supports various activity-specific fields
- **Metadata Support**: Location, weather, device info, notes

#### Usage:
```typescript
import { Activity, connectDB } from '@/models';

// Connect to database
await connectDB();

// Create a transport activity
const transportActivity = new Activity({
  userId: 'user123',
  type: 'transport',
  category: 'car',
  data: {
    distance: 50,
    vehicleType: 'car',
    fuelType: 'petrol',
    passengers: 1
  },
  timestamp: new Date()
});
await transportActivity.save();

// Create an electricity activity
const electricityActivity = new Activity({
  userId: 'user123',
  type: 'electricity',
  category: 'electricity_consumption',
  data: {
    units: 100,
    appliance: 'home'
  },
  timestamp: new Date()
});
await electricityActivity.save();

// Get user activities
const userActivities = await Activity.findByUser('user123', 20);

// Get emissions by type
const emissionsByType = await Activity.getEmissionsByType('user123');
```

## Database Connection

### MongoDB Connection (`mongodb.ts`)

Handles MongoDB connection with caching for Next.js API routes.

#### Usage:
```typescript
import { connectDB, isConnected, getConnectionStatus } from '@/models';

// Connect to database
await connectDB();

// Check connection status
if (isConnected()) {
  console.log('Database connected');
}

// Get connection status
console.log(getConnectionStatus()); // 'connected', 'disconnected', etc.
```

## Environment Variables

Add to your `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/emissionx
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/emissionx
```

## API Routes

### Users API (`/api/users`)

- **GET**: Fetch users with optional filtering
- **POST**: Create a new user

### Activities API (`/api/activities`)

- **GET**: Fetch activities with optional filtering by userId, type
- **POST**: Create a new activity

## Utility Functions

### Emission Calculations

```typescript
import { 
  calculateTransportEmissions,
  calculateElectricityEmissions,
  calculateLPGEmissions,
  calculateDietEmissions,
  calculatePurchaseEmissions
} from '@/models';

// Calculate transport emissions
const carEmissions = calculateTransportEmissions(50, 'car', 'petrol');

// Calculate electricity emissions
const electricityEmissions = calculateElectricityEmissions(100);

// Calculate LPG emissions
const lpgEmissions = calculateLPGEmissions(2);

// Calculate diet emissions
const dietEmissions = calculateDietEmissions('beef', 1.5);

// Calculate purchase emissions
const purchaseEmissions = calculatePurchaseEmissions(5000, 'clothing');
```

### Data Validation

```typescript
import { validateActivityData } from '@/models';

// Validate activity data
const validation = validateActivityData('transport', {
  distance: 25,
  vehicleType: 'car'
});

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

## Schema Structure

### User Schema
```typescript
{
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    units: { distance: 'km' | 'miles', weight: 'kg' | 'lbs', currency: 'INR' | 'USD' | 'EUR' };
    notifications: { email: boolean, push: boolean, weeklyReport: boolean, goalReminders: boolean };
    privacy: { shareData: boolean, publicProfile: boolean, showOnLeaderboard: boolean };
  };
  profile: {
    age?: number;
    location?: { country: string, state?: string, city?: string, coordinates?: { lat: number, lng: number } };
    occupation?: string;
    householdSize: number;
    lifestyle: { diet: 'vegetarian' | 'non-vegetarian' | 'vegan', transportation: 'car' | 'public' | 'bike' | 'mixed', homeType: 'apartment' | 'house' | 'shared', energySource: 'grid' | 'solar' | 'mixed' };
    goals: { monthlyTarget: number, yearlyTarget: number, targetDate?: Date };
  };
  stats: {
    totalEmissions: number;
    monthlyAverage: number;
    yearlyTotal: number;
    streak: number;
    lastCalculation?: Date;
    achievements: Array<{ id: string, title: string, description: string, icon: string, unlockedAt: Date, category: string, rarity: string }>;
    carbonSavings: number;
    treesPlanted: number;
    offsetPurchases: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Activity Schema
```typescript
{
  userId: string;
  type: 'transport' | 'electricity' | 'lpg' | 'diet' | 'purchases' | 'waste' | 'water' | 'heating' | 'cooling' | 'other';
  category: 'car' | 'bus' | 'train' | 'flight' | 'bike' | 'walk' | 'electricity_consumption' | 'lpg_usage' | 'food_consumption' | 'shopping' | 'waste_disposal' | 'water_usage' | 'heating_usage' | 'cooling_usage' | 'custom';
  data: {
    // Flexible data structure based on activity type
    distance?: number;
    units?: number;
    cylinders?: number;
    quantity?: number;
    amount?: number;
    weight?: number;
    volume?: number;
    // ... other fields
  };
  emissions: {
    co2: number;
    ch4?: number;
    n2o?: number;
    totalCO2e: number;
    factors: { co2PerUnit: number, unit: string, source: string, lastUpdated: Date };
    calculationMethod: 'default' | 'custom' | 'api';
    verified: boolean;
  };
  timestamp: Date;
  metadata?: {
    source: 'manual' | 'import' | 'api' | 'device' | 'app';
    location?: { lat: number, lng: number, address?: string };
    weather?: { temperature: number, humidity: number, conditions: string };
    tags?: string[];
    notes?: string;
    attachments?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Indexes

The models include optimized indexes for:
- User email lookup
- Activity queries by userId and timestamp
- Activity filtering by type and category
- Emission-based sorting
- Geographic queries

## Best Practices

1. **Always connect to database** before using models
2. **Use validation functions** before saving data
3. **Handle errors gracefully** in API routes
4. **Use appropriate indexes** for your query patterns
5. **Validate user input** before creating activities
6. **Use TypeScript interfaces** for type safety
7. **Implement proper error handling** and logging
