// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import the demo user creation function
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Setting up demo data for EmissionX...');
console.log('📁 Environment file:', path.resolve('.env.local'));

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  console.log('Please make sure you have MONGODB_URI in your .env.local file');
  process.exit(1);
}

console.log('✅ MONGODB_URI found');
console.log('🔗 MongoDB URI:', process.env.MONGODB_URI.substring(0, 20) + '...');

// Run the demo user creation script
exec('node scripts/create-demo-user.js', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running demo user script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Warning:', stderr);
  }
  
  console.log(stdout);
});
