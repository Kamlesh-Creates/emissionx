const mongoose = require('mongoose');

// User schema (simplified for the script)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    theme: { type: String, default: 'system' },
    units: {
      distance: { type: String, default: 'km' },
      weight: { type: String, default: 'kg' },
      currency: { type: String, default: 'INR' }
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true }
    },
    privacy: {
      shareData: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false },
      showOnLeaderboard: { type: Boolean, default: false }
    }
  },
  profile: {
    householdSize: { type: Number, default: 1 },
    lifestyle: {
      diet: { type: String, default: 'vegetarian' },
      transportation: { type: String, default: 'mixed' },
      homeType: { type: String, default: 'apartment' },
      energySource: { type: String, default: 'grid' }
    },
    goals: {
      monthlyTarget: { type: Number, default: 200 },
      yearlyTarget: { type: Number, default: 2400 }
    }
  },
  stats: {
    totalEmissions: { type: Number, default: 0 },
    monthlyAverage: { type: Number, default: 0 },
    yearlyTotal: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    achievements: [{
      id: String,
      title: String,
      description: String,
      icon: String,
      category: String,
      rarity: String,
      unlockedAt: { type: Date, default: Date.now }
    }],
    carbonSavings: { type: Number, default: 0 },
    treesPlanted: { type: Number, default: 0 },
    offsetPurchases: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Activity schema (simplified for the script)
const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  emissions: {
    co2: { type: Number, required: true },
    totalCO2e: { type: Number, required: true },
    factors: {
      co2PerUnit: { type: Number, required: true },
      unit: { type: String, required: true },
      source: { type: String, required: true },
      lastUpdated: { type: Date, default: Date.now }
    },
    calculationMethod: { type: String, default: 'default' },
    verified: { type: Boolean, default: false }
  },
  timestamp: { type: Date, required: true }
}, {
  timestamps: true
});

const Activity = mongoose.model('Activity', activitySchema);

async function createDemoUser() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.log('Please add MONGODB_URI to your .env.local file');
      return;
    }
    
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const demoUserId = new mongoose.Types.ObjectId("65d2e8e7e1a2b3c4d5e6f7a8");
    const existingUser = await User.findOne({ _id: demoUserId });
    if (existingUser) {
      console.log('ℹ️ Demo user already exists');
      await mongoose.disconnect();
      return;
    }

    // Create demo user
    const demoUser = new User({
      _id: demoUserId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      stats: {
        totalEmissions: 125.5,
        monthlyAverage: 45.2,
        yearlyTotal: 542.8,
        streak: 7,
        achievements: [
          {
            id: 'first_calculation',
            title: 'First Steps',
            description: 'Completed your first carbon footprint calculation',
            icon: '🌱',
            category: 'milestone',
            rarity: 'common',
            unlockedAt: new Date('2024-01-15')
          },
          {
            id: 'week_streak',
            title: 'Week Warrior',
            description: 'Maintained a 7-day calculation streak',
            icon: '🔥',
            category: 'streak',
            rarity: 'rare',
            unlockedAt: new Date('2024-01-22')
          },
          {
            id: 'low_emissions',
            title: 'Eco Champion',
            description: 'Kept monthly emissions under 50kg CO₂',
            icon: '🏆',
            category: 'emission',
            rarity: 'epic',
            unlockedAt: new Date('2024-01-20')
          }
        ],
        carbonSavings: 25.3,
        treesPlanted: 3,
        offsetPurchases: 150
      }
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully');

    // Create some demo activities
    const demoActivities = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: demoUserId,
        type: 'transport',
        category: 'car',
        data: {
          distance: 25,
          vehicleType: 'car',
          fuelType: 'petrol',
          passengers: 1
        },
        emissions: {
          co2: 4.8,
          totalCO2e: 4.8,
          factors: {
            co2PerUnit: 0.192,
            unit: 'km',
            source: 'transport_emissions',
            lastUpdated: new Date()
          },
          calculationMethod: 'default',
          verified: false
        },
        timestamp: new Date('2024-01-22T08:30:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        userId: demoUserId,
        type: 'electricity',
        category: 'electricity_consumption',
        data: {
          units: 120,
          appliance: 'home'
        },
        emissions: {
          co2: 98.4,
          totalCO2e: 98.4,
          factors: {
            co2PerUnit: 0.82,
            unit: 'kWh',
            source: 'electricity_emissions',
            lastUpdated: new Date()
          },
          calculationMethod: 'default',
          verified: false
        },
        timestamp: new Date('2024-01-21T12:00:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        userId: demoUserId,
        type: 'lpg',
        category: 'lpg_usage',
        data: {
          cylinders: 1,
          cylinderSize: 14.2
        },
        emissions: {
          co2: 21.3,
          totalCO2e: 21.3,
          factors: {
            co2PerUnit: 1.5,
            unit: 'kg',
            source: 'lpg_emissions',
            lastUpdated: new Date()
          },
          calculationMethod: 'default',
          verified: false
        },
        timestamp: new Date('2024-01-20T18:45:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        userId: demoUserId,
        type: 'diet',
        category: 'food_consumption',
        data: {
          foodType: 'vegetables',
          quantity: 2.5,
          mealType: 'lunch'
        },
        emissions: {
          co2: 5.0,
          totalCO2e: 5.0,
          factors: {
            co2PerUnit: 2.0,
            unit: 'kg',
            source: 'diet_emissions',
            lastUpdated: new Date()
          },
          calculationMethod: 'default',
          verified: false
        },
        timestamp: new Date('2024-01-19T13:30:00Z')
      },
      {
        _id: new mongoose.Types.ObjectId(),
        userId: demoUserId,
        type: 'purchases',
        category: 'shopping',
        data: {
          amount: 2500,
          category: 'clothing',
          item: 'Winter jacket'
        },
        emissions: {
          co2: 2.0,
          totalCO2e: 2.0,
          factors: {
            co2PerUnit: 0.8,
            unit: 'currency',
            source: 'purchase_emissions',
            lastUpdated: new Date()
          },
          calculationMethod: 'default',
          verified: false
        },
        timestamp: new Date('2024-01-18T15:20:00Z')
      }
    ];

    await Activity.insertMany(demoActivities);
    console.log('✅ Demo activities created successfully');

    console.log('🎉 Demo data setup complete!');
    console.log('You can now visit /profile to see the demo user profile.');

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
createDemoUser();
