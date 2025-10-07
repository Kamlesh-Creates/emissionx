// MongoDB connection
export { default as connectDB, isConnected, getConnectionStatus, closeConnection } from './mongodb';

// User models
export { default as User } from './users';
export type { IUser } from './users';

// Activity models
export { 
  default as Activity,
  calculateTransportEmissions,
  calculateElectricityEmissions,
  calculateLPGEmissions,
  calculateDietEmissions,
  calculatePurchaseEmissions,
  validateActivityData
} from './activity';

export type {
  IActivity,
  ActivityType,
  ActivityCategory,
} from './activity';
