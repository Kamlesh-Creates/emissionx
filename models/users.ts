import mongoose, { Schema, Document } from "mongoose";

// User Preferences Schema
const UserPreferencesSchema = new Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  units: {
    distance: { type: String, enum: ['km', 'miles'], default: 'km' },
    weight: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
    currency: { type: String, enum: ['INR', 'USD', 'EUR'], default: 'INR' }
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
}, { _id: false });

// User Profile Schema
const UserProfileSchema = new Schema({
  age: { type: Number, min: 13, max: 120 },
  location: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  occupation: { type: String },
  householdSize: { type: Number, default: 1, min: 1, max: 20 },
  lifestyle: {
    diet: { type: String, enum: ['vegetarian', 'non-vegetarian', 'vegan'], default: 'vegetarian' },
    transportation: { type: String, enum: ['car', 'public', 'bike', 'mixed'], default: 'mixed' },
    homeType: { type: String, enum: ['apartment', 'house', 'shared'], default: 'apartment' },
    energySource: { type: String, enum: ['grid', 'solar', 'mixed'], default: 'grid' }
  },
  goals: {
    monthlyTarget: { type: Number, default: 200, min: 0 }, // kg CO2
    yearlyTarget: { type: Number, default: 2400, min: 0 }, // kg CO2
    targetDate: { type: Date }
  }
}, { _id: false });

// Achievement Schema
const AchievementSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  category: { type: String, enum: ['emission', 'streak', 'savings', 'community', 'milestone'], required: true },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { _id: false });

// User Stats Schema
const UserStatsSchema = new Schema({
  totalEmissions: { type: Number, default: 0 }, // kg CO2
  monthlyAverage: { type: Number, default: 0 }, // kg CO2
  yearlyTotal: { type: Number, default: 0 }, // kg CO2
  streak: { type: Number, default: 0 }, // days
  lastCalculation: { type: Date },
  achievements: [AchievementSchema],
  carbonSavings: { type: Number, default: 0 }, // kg CO2 saved
  treesPlanted: { type: Number, default: 0 },
  offsetPurchases: { type: Number, default: 0 } // amount spent on offsets
}, { _id: false });

// Main User Interface
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    units: {
      distance: 'km' | 'miles';
      weight: 'kg' | 'lbs';
      currency: 'INR' | 'USD' | 'EUR';
    };
    notifications: {
      email: boolean;
      push: boolean;
      weeklyReport: boolean;
      goalReminders: boolean;
    };
    privacy: {
      shareData: boolean;
      publicProfile: boolean;
      showOnLeaderboard: boolean;
    };
  };
  profile: {
    age?: number;
    location?: {
      country: string;
      state?: string;
      city?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    occupation?: string;
    householdSize: number;
    lifestyle: {
      diet: 'vegetarian' | 'non-vegetarian' | 'vegan';
      transportation: 'car' | 'public' | 'bike' | 'mixed';
      homeType: 'apartment' | 'house' | 'shared';
      energySource: 'grid' | 'solar' | 'mixed';
    };
    goals: {
      monthlyTarget: number;
      yearlyTarget: number;
      targetDate?: Date;
    };
  };
  stats: {
    totalEmissions: number;
    monthlyAverage: number;
    yearlyTotal: number;
    streak: number;
    lastCalculation?: Date;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
      unlockedAt: Date;
      category: 'emission' | 'streak' | 'savings' | 'community' | 'milestone';
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    carbonSavings: number;
    treesPlanted: number;
    offsetPurchases: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Main User Schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar: { type: String },
  preferences: { type: UserPreferencesSchema, default: () => ({}) },
  profile: { type: UserProfileSchema, default: () => ({}) },
  stats: { type: UserStatsSchema, default: () => ({}) }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.location.country': 1 });
UserSchema.index({ 'stats.totalEmissions': -1 });
UserSchema.index({ createdAt: -1 });

// Virtual for user ID
UserSchema.virtual('id').get(function(this: IUser) {
  return this._id.toString();
});

// Pre-save middleware to set default values
UserSchema.pre('save', function(this: IUser, next: () => void) {
  if (this.isNew) {
    // Set default preferences if not provided
    if (!this.preferences) {
      this.preferences = {
        theme: 'system',
        units: { distance: 'km', weight: 'kg', currency: 'INR' },
        notifications: { email: true, push: true, weeklyReport: true, goalReminders: true },
        privacy: { shareData: false, publicProfile: false, showOnLeaderboard: false }
      };
    }
    
    // Set default profile if not provided
    if (!this.profile) {
      this.profile = {
        householdSize: 1,
        lifestyle: { diet: 'vegetarian', transportation: 'mixed', homeType: 'apartment', energySource: 'grid' },
        goals: { monthlyTarget: 200, yearlyTarget: 2400 }
      };
    }
    
    // Set default stats if not provided
    if (!this.stats) {
      this.stats = {
        totalEmissions: 0,
        monthlyAverage: 0,
        yearlyTotal: 0,
        streak: 0,
        achievements: [],
        carbonSavings: 0,
        treesPlanted: 0,
        offsetPurchases: 0
      };
    }
  }
  next();
});

// Instance methods
UserSchema.methods.updateEmissions = function(this: IUser, emissions: number) {
  this.stats.totalEmissions += emissions;
  this.stats.lastCalculation = new Date();
  return this.save();
};

UserSchema.methods.addAchievement = function(this: IUser, achievement: any) {
  this.stats.achievements.push(achievement);
  return this.save();
};

UserSchema.methods.updateStreak = function(this: IUser) {
  const today = new Date();
  const lastCalc = this.stats.lastCalculation;
  
  if (lastCalc) {
    const diffTime = today.getTime() - lastCalc.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.stats.streak += 1;
    } else if (diffDays > 1) {
      this.stats.streak = 1;
    }
  } else {
    this.stats.streak = 1;
  }
  
  return this.save();
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

UserSchema.statics.findTopEmitters = function(limit: number = 10) {
  return this.find({ 'privacy.showOnLeaderboard': true })
    .sort({ 'stats.totalEmissions': -1 })
    .limit(limit)
    .select('name email stats.totalEmissions stats.achievements.length');
};

// Export the model
export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
