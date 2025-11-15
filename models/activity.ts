import mongoose, { Schema, Document } from "mongoose";

// Activity Types and Categories
export type ActivityType = 
  | 'transport'
  | 'electricity'
  | 'lpg'
  | 'diet'
  | 'purchases'
  | 'waste'
  | 'water'
  | 'heating'
  | 'cooling'
  | 'other';

export type ActivityCategory = 
  | 'car'
  | 'bus'
  | 'train'
  | 'flight'
  | 'bike'
  | 'walk'
  | 'electricity_consumption'
  | 'lpg_usage'
  | 'food_consumption'
  | 'shopping'
  | 'waste_disposal'
  | 'water_usage'
  | 'heating_usage'
  | 'cooling_usage'
  | 'custom';

// Activity Data Schema
const ActivityDataSchema = new Schema({
  // Transport data
  distance: { type: Number, min: 0 }, // km
  duration: { type: Number, min: 0 }, // hours
  vehicleType: { type: String },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'] },
  passengers: { type: Number, min: 1, default: 1 },
  
  // Electricity data
  units: { type: Number, min: 0 }, // kWh
  appliance: { type: String },
  
  // LPG data
  cylinders: { type: Number, min: 0 },
  cylinderSize: { type: Number, min: 0, default: 14.2 }, // kg
  
  // Diet data
  foodType: { type: String },
  quantity: { type: Number, min: 0 }, // kg or servings
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  
  // Purchase data
  amount: { type: Number, min: 0 }, // currency
  category: { type: String },
  item: { type: String },
  
  // Waste data
  wasteType: { type: String, enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'mixed'] },
  weight: { type: Number, min: 0 }, // kg
  
  // Water data
  volume: { type: Number, min: 0 }, // liters
  usageType: { type: String, enum: ['drinking', 'cooking', 'cleaning', 'bathing', 'other'] },
  
  // Custom data
  customFields: { type: Map, of: Schema.Types.Mixed }
}, { _id: false });

// Emission Factors Schema
const EmissionFactorsSchema = new Schema({
  co2PerUnit: { type: Number, required: true },
  ch4PerUnit: { type: Number, default: 0 },
  n2oPerUnit: { type: Number, default: 0 },
  unit: { type: String, required: true },
  source: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

// Emission Data Schema
const EmissionDataSchema = new Schema({
  co2: { type: Number, required: true, min: 0 }, // kg CO2
  ch4: { type: Number, default: 0, min: 0 }, // kg CH4
  n2o: { type: Number, default: 0, min: 0 }, // kg N2O
  totalCO2e: { type: Number, required: true, min: 0 }, // kg CO2 equivalent
  factors: { type: EmissionFactorsSchema, required: true },
  calculationMethod: { type: String, enum: ['default', 'custom', 'api'], default: 'default' },
  verified: { type: Boolean, default: false }
}, { _id: false });

// Activity Metadata Schema
const ActivityMetadataSchema = new Schema({
  source: { type: String, enum: ['manual', 'import', 'api', 'device', 'app'], default: 'manual' },
  deviceId: { type: String },
  appVersion: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  weather: {
    temperature: { type: Number },
    humidity: { type: Number },
    conditions: { type: String }
  },
  tags: [{ type: String }],
  notes: { type: String },
  attachments: [{ type: String }] // file URLs
}, { _id: false });

// Main Activity Interface
export interface IActivity extends Document {
  _id: string;
  userId: string;
  type: ActivityType;
  category: ActivityCategory;
  data: {
    // Transport data
    distance?: number;
    duration?: number;
    vehicleType?: string;
    fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng';
    passengers?: number;
    
    // Electricity data
    units?: number;
    appliance?: string;
    
    // LPG data
    cylinders?: number;
    cylinderSize?: number;
    
    // Diet data
    foodType?: string;
    quantity?: number;
    mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    
    // Purchase data
    amount?: number;
    category?: string;
    item?: string;
    
    // Waste data
    wasteType?: 'organic' | 'plastic' | 'paper' | 'metal' | 'glass' | 'mixed';
    weight?: number;
    
    // Water data
    volume?: number;
    usageType?: 'drinking' | 'cooking' | 'cleaning' | 'bathing' | 'other';
    
    // Custom data
    customFields?: Map<string, any>;
  };
  emissions: {
    co2: number;
    ch4?: number;
    n2o?: number;
    totalCO2e: number;
    factors: {
      co2PerUnit: number;
      ch4PerUnit?: number;
      n2oPerUnit?: number;
      unit: string;
      source: string;
      lastUpdated: Date;
    };
    calculationMethod: 'default' | 'custom' | 'api';
    verified: boolean;
  };
  timestamp: Date;
  metadata?: {
    source: 'manual' | 'import' | 'api' | 'device' | 'app';
    deviceId?: string;
    appVersion?: string;
    location?: {
      lat: number;
      lng: number;
      address?: string;
    };
    weather?: {
      temperature: number;
      humidity: number;
      conditions: string;
    };
    tags?: string[];
    notes?: string;
    attachments?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Main Activity Schema
const ActivitySchema = new Schema<IActivity>({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['transport', 'electricity', 'lpg', 'diet', 'purchases', 'waste', 'water', 'heating', 'cooling', 'other'],
    index: true
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['car', 'bus', 'train', 'flight', 'bike', 'walk', 'electricity_consumption', 'lpg_usage', 'food_consumption', 'shopping', 'waste_disposal', 'water_usage', 'heating_usage', 'cooling_usage', 'custom'],
    index: true
  },
  data: { type: ActivityDataSchema, required: true },
  emissions: { type: EmissionDataSchema, required: true },
  timestamp: { type: Date, required: true, index: true },
  metadata: { type: ActivityMetadataSchema }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ type: 1, category: 1 });
ActivitySchema.index({ 'emissions.totalCO2e': -1 });
ActivitySchema.index({ createdAt: -1 });

// Virtual for activity ID
ActivitySchema.virtual('id').get(function(this: IActivity) {
  return this._id.toString();
});

// Pre-save middleware to calculate emissions if not provided
ActivitySchema.pre('save', function(this: IActivity, next: () => void) {
  // Always calculate emissions for new documents if not already set
  if (this.isNew && (!this.emissions || !this.emissions.co2 || !this.emissions.factors || !this.emissions.factors?.unit)) {
    // Calculate emissions based on activity type and data
    try {
      const calculatedEmissions = calculateEmissionsForActivity(this);
      this.emissions = calculatedEmissions;
    } catch (error) {
      console.error('Error calculating emissions for activity:', error);
      console.error('Activity data:', { type: this.type, category: this.category, data: this.data });
      // Set default emissions if calculation fails
      this.emissions = {
        co2: 0,
        totalCO2e: 0,
        factors: {
          co2PerUnit: 0,
          unit: 'unknown',
          source: 'default',
          lastUpdated: new Date()
        },
        calculationMethod: 'default' as const,
        verified: false
      };
    }
  }
  next();
});

// Helper function to calculate emissions
const calculateEmissionsForActivity = (activity: IActivity) => {
  const { type, data } = activity;
  let co2 = 0;
  let factors = {
    co2PerUnit: 0,
    unit: '',
    source: 'default',
    lastUpdated: new Date()
  };

  switch (type) {
    case 'transport':
      if (data.distance) {
        const vehicleKey = `${data.vehicleType || 'car'}_${data.fuelType || 'petrol'}`.toLowerCase();
        const emissionFactors: Record<string, number> = {
          'car_petrol': 0.192,
          'car_diesel': 0.171,
          'car_electric': 0.053,
          'car_hybrid': 0.120,
          'car_cng': 0.147,
          'bus': 0.089,
          'train': 0.041,
          'flight_domestic': 0.255,
          'flight_international': 0.285,
          'bike': 0.000,
          'walk': 0.000,
        };
        
        co2 = data.distance * (emissionFactors[vehicleKey] || emissionFactors['car_petrol']);
        factors = {
          co2PerUnit: emissionFactors[vehicleKey] || emissionFactors['car_petrol'],
          unit: 'km',
          source: 'transport_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'electricity':
      if (data.units) {
        co2 = data.units * 0.82; // India's grid average
        factors = {
          co2PerUnit: 0.82,
          unit: 'kWh',
          source: 'electricity_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'lpg':
      if (data.cylinders) {
        co2 = data.cylinders * (data.cylinderSize || 14.2) * 1.5;
        factors = {
          co2PerUnit: 1.5,
          unit: 'kg',
          source: 'lpg_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'diet':
      if (data.quantity) {
        const foodFactors: Record<string, number> = {
          'beef': 27.0,
          'lamb': 21.0,
          'pork': 12.0,
          'chicken': 6.9,
          'fish': 3.0,
          'eggs': 4.2,
          'dairy': 3.2,
          'rice': 4.0,
          'wheat': 1.4,
          'vegetables': 2.0,
          'fruits': 1.0,
          'nuts': 2.3,
          'legumes': 2.0,
        };
        
        const factor = foodFactors[data.foodType?.toLowerCase() || 'vegetables'] || 2.0;
        co2 = data.quantity * factor;
        factors = {
          co2PerUnit: factor,
          unit: 'kg',
          source: 'diet_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'purchases':
      if (data.amount) {
        const purchaseFactors: Record<string, number> = {
          'clothing': 0.8,
          'electronics': 0.6,
          'food': 0.4,
          'furniture': 0.7,
          'general': 0.5,
          'transport': 0.9,
          'entertainment': 0.3,
        };
        
        const factor = purchaseFactors[data.category?.toLowerCase() || 'general'] || 0.5;
        co2 = (data.amount / 1000) * factor;
        factors = {
          co2PerUnit: factor,
          unit: 'currency',
          source: 'purchase_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'waste':
      if (data.weight) {
        const wasteFactors: Record<string, number> = {
          'organic': 0.5,
          'plastic': 2.0,
          'paper': 1.0,
          'metal': 1.5,
          'glass': 0.8,
          'mixed': 1.2,
        };
        
        const factor = wasteFactors[data.wasteType || 'mixed'] || 1.2;
        co2 = data.weight * factor;
        factors = {
          co2PerUnit: factor,
          unit: 'kg',
          source: 'waste_emissions',
          lastUpdated: new Date()
        };
      }
      break;

    case 'water':
      if (data.volume) {
        co2 = data.volume * 0.0003; // Very low emissions for water usage
        factors = {
          co2PerUnit: 0.0003,
          unit: 'liters',
          source: 'water_emissions',
          lastUpdated: new Date()
        };
      }
      break;
  }

  // Ensure factors has a valid unit
  if (!factors.unit) {
    factors.unit = 'unknown';
  }

  return {
    co2: co2 || 0,
    totalCO2e: co2 || 0,
    factors: {
      ...factors,
      co2PerUnit: factors.co2PerUnit || 0,
      unit: factors.unit,
      source: factors.source || 'default',
      lastUpdated: factors.lastUpdated || new Date()
    },
    calculationMethod: 'default' as const,
    verified: false
  };
};

// Instance methods
ActivitySchema.methods.calculateEmissions = function(this: IActivity) {
  return calculateEmissionsForActivity(this);
};

// Static methods
ActivitySchema.statics.findByUser = function(userId: string, limit: number = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

ActivitySchema.statics.findByType = function(type: ActivityType, limit: number = 50) {
  return this.find({ type })
    .sort({ timestamp: -1 })
    .limit(limit);
};

ActivitySchema.statics.getUserEmissions = function(userId: string, startDate?: Date, endDate?: Date) {
  const query: any = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEmissions: { $sum: '$emissions.totalCO2e' },
        activityCount: { $sum: 1 },
        averageEmissions: { $avg: '$emissions.totalCO2e' },
        breakdown: {
          $push: {
            type: '$type',
            category: '$category',
            emissions: '$emissions.totalCO2e'
          }
        }
      }
    }
  ]);
};

ActivitySchema.statics.getEmissionsByType = function(userId: string, startDate?: Date, endDate?: Date) {
  const query: any = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$type',
        totalEmissions: { $sum: '$emissions.totalCO2e' },
        count: { $sum: 1 },
        averageEmissions: { $avg: '$emissions.totalCO2e' }
      }
    },
    { $sort: { totalEmissions: -1 } }
  ]);
};

// Export the model
export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);

// Export utility functions
export const calculateTransportEmissions = (
  distance: number,
  vehicleType: string,
  fuelType: string = 'petrol'
): number => {
  const factors: Record<string, number> = {
    'car_petrol': 0.192,
    'car_diesel': 0.171,
    'car_electric': 0.053,
    'car_hybrid': 0.120,
    'car_cng': 0.147,
    'bus': 0.089,
    'train': 0.041,
    'flight_domestic': 0.255,
    'flight_international': 0.285,
    'bike': 0.000,
    'walk': 0.000,
  };
  
  const key = `${vehicleType}_${fuelType}`.toLowerCase();
  const factor = factors[key] || factors['car_petrol'];
  
  return distance * factor;
};

export const calculateElectricityEmissions = (units: number, gridFactor: number = 0.82): number => {
  return units * gridFactor;
};

export const calculateLPGEmissions = (cylinders: number, cylinderSize: number = 14.2): number => {
  return cylinders * cylinderSize * 1.5;
};

export const calculateDietEmissions = (
  foodType: string,
  quantity: number,
  mealType: string = 'lunch'
): number => {
  const factors: Record<string, number> = {
    'beef': 27.0,
    'lamb': 21.0,
    'pork': 12.0,
    'chicken': 6.9,
    'fish': 3.0,
    'eggs': 4.2,
    'dairy': 3.2,
    'rice': 4.0,
    'wheat': 1.4,
    'vegetables': 2.0,
    'fruits': 1.0,
    'nuts': 2.3,
    'legumes': 2.0,
  };
  
  const factor = factors[foodType.toLowerCase()] || 2.0;
  return quantity * factor;
};

export const calculatePurchaseEmissions = (amount: number, category: string = 'general'): number => {
  const factors: Record<string, number> = {
    'clothing': 0.8,
    'electronics': 0.6,
    'food': 0.4,
    'furniture': 0.7,
    'general': 0.5,
    'transport': 0.9,
    'entertainment': 0.3,
  };
  
  const factor = factors[category.toLowerCase()] || factors['general'];
  return (amount / 1000) * factor;
};

// Validation function
export const validateActivityData = (type: ActivityType, data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  switch (type) {
    case 'transport':
      if (!data.distance || data.distance <= 0) {
        errors.push('Distance must be greater than 0');
      }
      if (data.distance && data.distance > 10000) {
        errors.push('Distance seems unrealistic (over 10,000 km)');
      }
      break;
      
    case 'electricity':
      if (!data.units || data.units <= 0) {
        errors.push('Electricity units must be greater than 0');
      }
      if (data.units && data.units > 10000) {
        errors.push('Electricity usage seems unrealistic (over 10,000 kWh)');
      }
      break;
      
    case 'lpg':
      if (!data.cylinders || data.cylinders <= 0) {
        errors.push('Number of cylinders must be greater than 0');
      }
      if (data.cylinders && data.cylinders > 50) {
        errors.push('Number of cylinders seems unrealistic (over 50)');
      }
      break;
      
    case 'diet':
      if (!data.quantity || data.quantity <= 0) {
        errors.push('Food quantity must be greater than 0');
      }
      break;
      
    case 'purchases':
      if (!data.amount || data.amount <= 0) {
        errors.push('Purchase amount must be greater than 0');
      }
      break;
      
    case 'waste':
      if (!data.weight || data.weight <= 0) {
        errors.push('Waste weight must be greater than 0');
      }
      if (data.weight && data.weight > 1000) {
        errors.push('Waste weight seems unrealistic (over 1000 kg)');
      }
      break;
      
    case 'water':
      if (!data.volume || data.volume <= 0) {
        errors.push('Water volume must be greater than 0');
      }
      if (data.volume && data.volume > 10000) {
        errors.push('Water usage seems unrealistic (over 10,000 liters)');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};